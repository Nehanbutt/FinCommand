/**
 * Employee Performance Scoring Engine
 * ------------------------------------------------------------------------
 * A transparent, rule-based scoring model — no ML black box. Every number
 * on an employee's scorecard can be traced back to inputs on one screen.
 *
 *   Score = f(Productivity, Efficiency, Cost-Effectiveness, Quality) →
 *           normalized within peer cohort → reported with a Confidence Score
 *
 * Design notes / where this deliberately goes beyond a literal reading of
 * the original spec, and why:
 *
 *  - PR, E and CE are z-scored WITHIN the peer cohort individually before
 *    being combined. A role that produces "40 loans/month" and a role that
 *    produces "0.6 large deals/month" live on wildly different numeric
 *    scales; averaging their raw values directly (as a literal reading of
 *    the spec's Step 5 would do) lets whichever metric happens to have the
 *    larger raw magnitude dominate the composite. Standardizing each
 *    component first, then combining, is what makes the weights (§4 of the
 *    spec) actually mean what they claim to mean.
 *  - Quality Factor is applied as a multiplier on the combined z-score
 *    (not on a 0-100 percentile), so a poor QF pulls a strong raw performer
 *    down without ever fully erasing a genuinely exceptional cohort-relative
 *    result — same anti-gaming intent as the spec (§3 Step 4), applied at
 *    the standardized-score stage instead of the raw-score stage.
 *  - Percentiles are computed empirically (rank within cohort) rather than
 *    via the normal CDF, since employee cohorts are usually small and not
 *    reliably normal (§5 explicitly allows this fallback — we just always
 *    use it, for consistency).
 */

import { Company, Employee, RoleArchetype } from './types';

// ---------------------------------------------------------------------------
// Configuration (all of this is exactly what a "config screen, not code"
// would hold in a production build — kept here, centralized and commented,
// so it's the one place to tune).
// ---------------------------------------------------------------------------

const WEEKS_PER_MONTH = 4.345;
const MIN_COHORT_SIZE = 8;
const QUALITY_FACTOR_FLOOR = 0.5;

/** §9 — ramp-up benchmark curve. Tenure in months -> fraction of full-proficiency output expected. */
const RAMP_CURVE: { maxMonths: number; factor: number }[] = [
  { maxMonths: 1, factor: 0.40 },
  { maxMonths: 3, factor: 0.65 },
  { maxMonths: 6, factor: 0.85 },
  { maxMonths: 12, factor: 1.00 },
  { maxMonths: Infinity, factor: 1.00 },
];

/** §11 — archetype -> weight tilt across Productivity / Efficiency / Cost-Effectiveness. Always sums to 1. */
const ARCHETYPE_WEIGHTS: Record<RoleArchetype, { pr: number; e: number; ce: number; label: string; outputHint: string }> = {
  volume: { pr: 0.50, e: 0.15, ce: 0.35, label: 'Volume / quota-driven', outputHint: 'e.g. deals closed, amount collected' },
  transaction: { pr: 0.35, e: 0.40, ce: 0.25, label: 'Transaction processing', outputHint: 'e.g. loans, claims, transactions processed' },
  service: { pr: 0.40, e: 0.30, ce: 0.30, label: 'Service / resolution', outputHint: 'e.g. tickets resolved' },
  support: { pr: 0.45, e: 0.25, ce: 0.30, label: 'Output-light / support function', outputHint: 'no clean output metric — treated as lower confidence' },
};

const BAND = {
  top10: { min: 90, label: 'Top 10%', color: '#3DDC97' },
  aboveAvg: { min: 75, label: 'Above Average', color: '#4C8CFF' },
  onTrack: { min: 40, label: 'On Track', color: '#8B5CF6' },
  needsSupport: { min: 0, label: 'Needs Support', color: '#E8555A' },
};

function bandFor(percentile: number) {
  if (percentile >= BAND.top10.min) return BAND.top10;
  if (percentile >= BAND.aboveAvg.min) return BAND.aboveAvg;
  if (percentile >= BAND.onTrack.min) return BAND.onTrack;
  return BAND.needsSupport;
}

// ---------------------------------------------------------------------------
// Small stats helpers
// ---------------------------------------------------------------------------

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function stdDev(xs: number[], m: number): number {
  if (xs.length < 2) return 0;
  const variance = xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

function zScore(x: number, m: number, sd: number): number {
  if (sd === 0) return 0; // everyone identical on this metric — no signal, no penalty
  return (x - m) / sd;
}

/** Winsorize: clamp values at the cohort's 1st/99th percentile so one freak
 *  month doesn't distort the mean/std for everyone else in the cohort (§6). */
function winsorize(xs: number[]): number[] {
  if (xs.length < 5) return xs; // not enough data for percentile clamping to be meaningful
  const sorted = [...xs].sort((a, b) => a - b);
  const lo = sorted[Math.floor(0.01 * (sorted.length - 1))];
  const hi = sorted[Math.ceil(0.99 * (sorted.length - 1))];
  return xs.map((x) => Math.min(hi, Math.max(lo, x)));
}

/** Empirical percentile rank of `x` within `xs` (0-100, higher = better). */
function empiricalPercentile(x: number, xs: number[]): number {
  if (xs.length <= 1) return 50;
  const below = xs.filter((v) => v < x).length;
  const equal = xs.filter((v) => v === x).length;
  // mid-rank method: ties share the percentile of their group's midpoint
  return Math.round(((below + equal / 2) / xs.length) * 100);
}

function tenureMonths(joiningDate: string, asOf = Date.now()): number {
  const ms = asOf - new Date(joiningDate).getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 30));
}

function rampFactor(months: number): number {
  for (const step of RAMP_CURVE) {
    if (months <= step.maxMonths) return step.factor;
  }
  return 1;
}

// ---------------------------------------------------------------------------
// Cohort building (§5 + §6)
// ---------------------------------------------------------------------------

interface Cohort {
  members: Employee[];
  scope: 'department' | 'archetype' | 'company';
}

function buildCohort(employee: Employee, activeEmployees: Employee[]): Cohort {
  const sameDept = activeEmployees.filter((e) => e.department === employee.department);
  if (sameDept.length >= MIN_COHORT_SIZE) return { members: sameDept, scope: 'department' };

  const archetype = employee.roleArchetype ?? 'support';
  const sameArchetype = activeEmployees.filter((e) => (e.roleArchetype ?? 'support') === archetype);
  if (sameArchetype.length >= MIN_COHORT_SIZE) return { members: sameArchetype, scope: 'archetype' };

  return { members: activeEmployees, scope: 'company' };
}

// ---------------------------------------------------------------------------
// Per-employee raw components (§3)
// ---------------------------------------------------------------------------

interface RawComponents {
  pr: number;
  e: number;
  ce: number;
  qf: number;
  hasOutputData: boolean;
  hasErrorData: boolean;
  usedPeerBaseline: boolean;
  monthlyCost: number;
  periodHours: number;
}

function computeRawComponents(employee: Employee, cohortPeers: Employee[], company: Company): RawComponents {
  const monthlyCost = employee.salary / 12;
  const periodHours = Math.max(1, employee.workingHours) * WEEKS_PER_MONTH;
  const months = tenureMonths(employee.joiningDate);
  const ramp = rampFactor(months);

  const hasOutputData = typeof employee.actualOutput === 'number' && employee.actualOutput >= 0;

  if (!hasOutputData) {
    // Graceful degradation: fall back to the revenue-per-employee proxy so
    // the employee still gets a directional score, just a low-confidence one.
    const activeCount = Math.max(1, cohortPeers.length);
    const revPerEmp = company.monthlyRevenue / activeCount;
    const pr = monthlyCost > 0 ? revPerEmp / monthlyCost : 1;
    return {
      pr, e: pr, ce: pr, qf: 1,
      hasOutputData: false, hasErrorData: false, usedPeerBaseline: true,
      monthlyCost, periodHours,
    };
  }

  const actualOutput = employee.actualOutput as number;

  // Expected output baseline: employee's own configured baseline, else peer
  // average actual output within the cohort, else fall back to itself (PR=1, neutral).
  let expected = employee.expectedOutput;
  let usedPeerBaseline = false;
  if (!expected || expected <= 0) {
    const peerOutputs = cohortPeers
      .filter((p) => p.id !== employee.id && typeof p.actualOutput === 'number' && (p.actualOutput as number) > 0)
      .map((p) => p.actualOutput as number);
    if (peerOutputs.length) {
      expected = mean(peerOutputs);
      usedPeerBaseline = true;
    } else {
      expected = actualOutput || 1;
      usedPeerBaseline = true;
    }
  }
  const rampedExpected = Math.max(0.01, expected * ramp);
  const pr = actualOutput / rampedExpected;

  const e = actualOutput / periodHours;

  // Unit value must NOT be a function of this employee's own output, or output
  // cancels out of Cost Effectiveness entirely (outputValue = output * (rev/n/output))
  // and CE degenerates back into a flat revenue-per-head number identical for
  // everyone — silently reopening the exact gaming hole §2/§3 exist to close.
  // Instead: use a configured unit value, else a shared price-per-unit derived
  // from total *measured* output across the cohort (so it rewards, not cancels,
  // higher individual output relative to peers).
  let unitValue = employee.outputUnitValue && employee.outputUnitValue > 0 ? employee.outputUnitValue : 0;
  if (!unitValue) {
    const totalCohortOutput = cohortPeers.reduce((s, p) => s + (typeof p.actualOutput === 'number' && p.actualOutput > 0 ? p.actualOutput : 0), 0);
    unitValue = company.monthlyRevenue > 0 && totalCohortOutput > 0
      ? company.monthlyRevenue / totalCohortOutput
      : (monthlyCost > 0 ? monthlyCost / actualOutput : 1);
  }
  const outputValue = actualOutput * unitValue;
  const ce = monthlyCost > 0 ? outputValue / monthlyCost : 1;

  const hasErrorData = typeof employee.errorCount === 'number' && employee.errorCount >= 0;
  const qf = hasErrorData && actualOutput > 0
    ? Math.max(QUALITY_FACTOR_FLOOR, 1 - (employee.errorCount as number) / actualOutput)
    : 1;

  return { pr, e, ce, qf, hasOutputData: true, hasErrorData, usedPeerBaseline, monthlyCost, periodHours };
}

// ---------------------------------------------------------------------------
// Confidence scoring (§8)
// ---------------------------------------------------------------------------

function computeConfidence(employee: Employee, raw: RawComponents, cohortSize: number): { score: number; label: 'High' | 'Moderate' | 'Low'; reasons: string[] } {
  const reasons: string[] = [];

  const fields = [raw.hasOutputData, !!employee.expectedOutput, !!employee.outputUnitValue, raw.hasErrorData];
  const dataCompleteness = fields.filter(Boolean).length / fields.length;
  if (!raw.hasOutputData) reasons.push('No output data entered — score uses a revenue-proxy fallback');
  else if (raw.usedPeerBaseline) reasons.push('No expected-output baseline set — using peer cohort average');
  if (!raw.hasErrorData) reasons.push('No error/rework count — quality factor defaults to neutral');

  const months = tenureMonths(employee.joiningDate);
  const sampleSizeFactor = Math.min(1, months / 1); // full weight once they have a month of data
  if (sampleSizeFactor < 1) reasons.push('Less than one full period of tenure data available');

  const cohortSizeFactor = Math.min(1, cohortSize / 20);
  if (cohortSize < MIN_COHORT_SIZE) reasons.push(`Small peer cohort (${cohortSize}) — comparisons are less stable`);

  const qualitySignalFactor = raw.hasErrorData ? 1 : 0.4;

  const score = Math.round(100 * (0.35 * dataCompleteness + 0.20 * sampleSizeFactor + 0.25 * cohortSizeFactor + 0.20 * qualitySignalFactor));
  const label = score >= 80 ? 'High' : score >= 55 ? 'Moderate' : 'Low';
  return { score, label, reasons };
}

// ---------------------------------------------------------------------------
// Public scorecard shape
// ---------------------------------------------------------------------------

export interface EmployeeScorecard {
  id: number;
  name: string;
  department: string;
  position: string;
  roleArchetype: RoleArchetype;
  archetypeLabel: string;
  outputLabel: string;
  employmentStatus: Employee['employmentStatus'];
  tenureMonths: number;
  rampFactor: number;

  components: {
    productivityRatio: number;
    efficiency: number;
    costEffectiveness: number;
    qualityFactor: number;
    weights: { pr: number; e: number; ce: number };
  };

  compositeZ: number;
  percentile: number;
  band: { label: string; color: string };

  confidence: { score: number; label: 'High' | 'Moderate' | 'Low'; reasons: string[] };

  cohort: { size: number; scope: 'department' | 'archetype' | 'company'; label: string };

  isOutlier: boolean;
  needsReview: boolean; // top or bottom 5% of company — candidate for the quarterly sanity check
  usingProxyData: boolean;

  explanation: string[];

  reviewFlag?: Employee['reviewFlag'];
  reviewNote?: string;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export function scoreEmployeePerformance(employees: Employee[], company: Company): EmployeeScorecard[] {
  const active = employees.filter((e) => e.isActive);
  if (!active.length) return [];

  // Precompute raw components + cohort for every active employee once.
  const perEmployee = active.map((employee) => {
    const cohort = buildCohort(employee, active);
    const raw = computeRawComponents(employee, cohort.members, company);
    return { employee, cohort, raw };
  });

  const results: EmployeeScorecard[] = perEmployee.map(({ employee, cohort, raw }) => {
    const archetype = employee.roleArchetype ?? 'support';
    const weights = ARCHETYPE_WEIGHTS[archetype];

    // Build the cohort's raw-component distributions (winsorized) to z-score against.
    const cohortRaw = cohort.members.map((peer) => {
      if (peer.id === employee.id) return raw;
      const peerCohort = perEmployee.find((p) => p.employee.id === peer.id);
      return peerCohort ? peerCohort.raw : computeRawComponents(peer, cohort.members, company);
    });

    const prPool = winsorize(cohortRaw.map((r) => r.pr));
    const ePool = winsorize(cohortRaw.map((r) => r.e));
    const cePool = winsorize(cohortRaw.map((r) => r.ce));

    const prMean = mean(prPool), prSd = stdDev(prPool, prMean);
    const eMean = mean(ePool), eSd = stdDev(ePool, eMean);
    const ceMean = mean(cePool), ceSd = stdDev(cePool, ceMean);

    const zPR = zScore(raw.pr, prMean, prSd);
    const zE = zScore(raw.e, eMean, eSd);
    const zCE = zScore(raw.ce, ceMean, ceSd);

    const compositeZRaw = weights.pr * zPR + weights.e * zE + weights.ce * zCE;
    const compositeZ = compositeZRaw * raw.qf; // quality multiplies the standardized composite (anti-gaming)

    // Empirical percentile of this composite Z within the cohort's own composite-Z distribution.
    const cohortComposites = cohort.members.map((peer) => {
      if (peer.id === employee.id) return compositeZ;
      const peerCohort = perEmployee.find((p) => p.employee.id === peer.id);
      const peerRaw = peerCohort ? peerCohort.raw : computeRawComponents(peer, cohort.members, company);
      const pzPR = zScore(peerRaw.pr, prMean, prSd);
      const pzE = zScore(peerRaw.e, eMean, eSd);
      const pzCE = zScore(peerRaw.ce, ceMean, ceSd);
      const peerArchetype = peer.roleArchetype ?? 'support';
      const peerWeights = ARCHETYPE_WEIGHTS[peerArchetype];
      return (peerWeights.pr * pzPR + peerWeights.e * pzE + peerWeights.ce * pzCE) * peerRaw.qf;
    });

    const percentile = empiricalPercentile(compositeZ, cohortComposites);
    const band = bandFor(percentile);
    const confidence = computeConfidence(employee, raw, cohort.members.length);
    const months = tenureMonths(employee.joiningDate);
    const ramp = rampFactor(months);

    const isOutlier = Math.abs(zPR) > 3 || Math.abs(zE) > 3 || Math.abs(zCE) > 3;
    const needsReview = percentile >= 95 || percentile <= 5;

    const explanation: string[] = [];
    if (!raw.hasOutputData) {
      explanation.push('No role output entered this period — scored on a revenue-per-employee proxy instead of real output. Add output data on the Employees page for an accurate score.');
    } else {
      explanation.push(
        raw.usedPeerBaseline
          ? `Productivity ratio ${raw.pr.toFixed(2)}× — measured against the peer average since no personal baseline was set.`
          : `Productivity ratio ${raw.pr.toFixed(2)}× their expected output for ${months < 12 ? `${months.toFixed(0)} months tenure (ramp ${Math.round(ramp * 100)}%)` : 'a fully ramped employee'}.`
      );
      explanation.push(`Efficiency: ${raw.e.toFixed(2)} units/hour across ${Math.round(raw.periodHours)} hours this period.`);
      explanation.push(`Cost effectiveness: ${raw.ce.toFixed(2)}× — value produced per dollar of compensation.`);
      if (raw.hasErrorData) {
        explanation.push(raw.qf < 1
          ? `Quality factor ${raw.qf.toFixed(2)} — errors/rework are discounting the score, not just being averaged away.`
          : 'No errors or rework recorded this period — quality factor at full strength.');
      } else {
        explanation.push('No error/rework count entered — quality factor defaults to neutral (1.0) and confidence is capped lower.');
      }
    }
    if (isOutlier) explanation.push('⚠ Statistically unusual result (>3σ from cohort) — flagged for HR review rather than auto-accepted.');

    return {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      roleArchetype: archetype,
      archetypeLabel: weights.label,
      outputLabel: employee.outputLabel || 'units',
      employmentStatus: employee.employmentStatus,
      tenureMonths: Math.round(months * 10) / 10,
      rampFactor: ramp,
      components: {
        productivityRatio: round2(raw.pr),
        efficiency: round2(raw.e),
        costEffectiveness: round2(raw.ce),
        qualityFactor: round2(raw.qf),
        weights: { pr: weights.pr, e: weights.e, ce: weights.ce },
      },
      compositeZ: round2(compositeZ),
      percentile,
      band: { label: band.label, color: band.color },
      confidence,
      cohort: { size: cohort.members.length, scope: cohort.scope, label: cohortLabel(cohort, employee) },
      isOutlier,
      needsReview,
      usingProxyData: !raw.hasOutputData,
      explanation,
      reviewFlag: employee.reviewFlag ?? null,
      reviewNote: employee.reviewNote,
    };
  });

  return results.sort((a, b) => b.percentile - a.percentile);
}

function cohortLabel(cohort: Cohort, employee: Employee): string {
  if (cohort.scope === 'department') return `${employee.department} (${cohort.members.length} peers)`;
  if (cohort.scope === 'archetype') return `${ARCHETYPE_WEIGHTS[employee.roleArchetype ?? 'support'].label} company-wide (${cohort.members.length} peers)`;
  return `Whole company (${cohort.members.length} employees)`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export function suggestArchetype(position: string): RoleArchetype {
  const p = position.toLowerCase();
  if (/(sales|account exec|business dev|collections|closer)/.test(p)) return 'volume';
  if (/(accountant|claims|loan|underwrit|processor|bookkeep|payroll)/.test(p)) return 'transaction';
  if (/(support|helpdesk|help desk|success|service|care)/.test(p)) return 'service';
  return 'support';
}

export { ARCHETYPE_WEIGHTS };
