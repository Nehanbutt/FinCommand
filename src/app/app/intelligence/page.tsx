'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { scoreEmployeePerformance, EmployeeScorecard, ordinal } from '@/lib/performanceEngine';
import { ShieldCheck, ShieldAlert, ShieldQuestion, AlertTriangle, ChevronDown, Info } from 'lucide-react';

function ScoreBar({ label, value, max = 2, sublabel }: { label: string; value: number; max?: number; sublabel?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="num text-slate-300">{value.toFixed(2)}{sublabel ? <span className="text-slate-600"> {sublabel}</span> : null}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4C8CFF, #8B5CF6)' }} />
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: EmployeeScorecard['confidence'] }) {
  const Icon = confidence.label === 'High' ? ShieldCheck : confidence.label === 'Moderate' ? ShieldQuestion : ShieldAlert;
  const color = confidence.label === 'High' ? '#3DDC97' : confidence.label === 'Moderate' ? '#E8A33D' : '#E8555A';
  return (
    <span className="badge" style={{ background: `${color}1f`, color }} title={confidence.reasons.join(' · ')}>
      <Icon size={12} /> {confidence.label} confidence · {confidence.score}%
    </span>
  );
}

function EmployeeCard({ card, onFlag }: { card: EmployeeScorecard; onFlag: (id: number, flag: 'confirmed' | 'disputed', note: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(card.reviewNote ?? '');

  return (
    <div className="card p-6 fade-in">
      <div className="flex items-start justify-between mb-1 gap-3">
        <div>
          <p className="text-white font-semibold">{card.name}</p>
          <p className="text-xs text-slate-500">{card.position} · {card.department} · {card.archetypeLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="badge" style={{ background: `${card.band.color}1f`, color: card.band.color }}>{card.band.label}</span>
          <span className="text-[11px] text-slate-500 num">{ordinal(card.percentile)} percentile</span>
        </div>
      </div>

      {card.isOutlier && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-400 bg-amber-400/10 rounded-lg px-2.5 py-1.5">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>Statistically unusual vs peers — flagged for review, not auto-scored.</span>
        </div>
      )}
      {card.usingProxyData && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-400 bg-white/5 rounded-lg px-2.5 py-1.5">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span>No output data yet — using a revenue-proxy fallback. Add this role's output on the Employees page for a real score.</span>
        </div>
      )}

      <div className="mt-4 mb-1">
        <ConfidenceBadge confidence={card.confidence} />
      </div>

      <div className="space-y-3 my-4">
        <ScoreBar label="Productivity ratio" value={card.components.productivityRatio} max={2} sublabel={`(w ${Math.round(card.components.weights.pr * 100)}%)`} />
        <ScoreBar label={`Efficiency (${card.outputLabel}/hr)`} value={card.components.efficiency} max={Math.max(1, card.components.efficiency * 1.5)} sublabel={`(w ${Math.round(card.components.weights.e * 100)}%)`} />
        <ScoreBar label="Cost effectiveness" value={card.components.costEffectiveness} max={2} sublabel={`(w ${Math.round(card.components.weights.ce * 100)}%)`} />
        <ScoreBar label="Quality factor (multiplier)" value={card.components.qualityFactor} max={1} />
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2"
      >
        <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Hide' : 'Show'} full breakdown
      </button>

      {expanded && (
        <div className="pt-3 border-t border-white/5 space-y-3">
          <p className="text-[11px] text-slate-500">
            Peer cohort: <span className="text-slate-300">{card.cohort.label}</span> · Tenure: <span className="text-slate-300">{card.tenureMonths} mo</span> (ramp {Math.round(card.rampFactor * 100)}%)
          </p>
          <ul className="space-y-1.5">
            {card.explanation.map((ex, i) => (
              <li key={i} className="text-xs text-slate-400 leading-snug">· {ex}</li>
            ))}
          </ul>
          {card.confidence.reasons.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-600 mb-1">Why confidence is {card.confidence.label.toLowerCase()}</p>
              <ul className="space-y-1">
                {card.confidence.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-slate-500 leading-snug">· {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {card.needsReview && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-wider text-slate-600 mb-2">
            Top/bottom 5% — quarterly sanity check
          </p>
          {card.reviewFlag ? (
            <p className="text-xs text-slate-400">
              Marked <span className={card.reviewFlag === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'}>{card.reviewFlag}</span>
              {card.reviewNote ? <> — "{card.reviewNote}"</> : null}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Anything about this score look wrong to you?</p>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional one-line note…"
                className="input-field !py-1.5 !text-xs w-full"
              />
              <div className="flex gap-2">
                <button onClick={() => onFlag(card.id, 'confirmed', note)} className="btn-secondary text-xs py-1.5 px-3">Looks right</button>
                <button onClick={() => onFlag(card.id, 'disputed', note)} className="btn-secondary text-xs py-1.5 px-3">Flag as off</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IntelligencePage() {
  const { company, employees, updateEmployee } = useStore();
  const scored = useMemo(() => (company ? scoreEmployeePerformance(employees, company) : []), [company, employees]);

  const bandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    scored.forEach((s) => { counts[s.band.label] = (counts[s.band.label] ?? 0) + 1; });
    return counts;
  }, [scored]);

  const avgConfidence = useMemo(() => {
    if (!scored.length) return 0;
    return Math.round(scored.reduce((s, c) => s + c.confidence.score, 0) / scored.length);
  }, [scored]);

  const proxyCount = useMemo(() => scored.filter((s) => s.usingProxyData).length, [scored]);

  const handleFlag = (id: number, flag: 'confirmed' | 'disputed', note: string) => {
    updateEmployee(id, { reviewFlag: flag, reviewNote: note || undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Employee intelligence</h1>
        <p className="text-sm text-slate-500">
          Productivity, efficiency, cost-effectiveness, and quality — scored against peers, explained in full, with a confidence rating on every number.
        </p>
        <p className="text-xs text-slate-600 mt-2 max-w-3xl">
          Each score is a percentile within a peer cohort of employees in the same department (or role, if the department is too small to compare fairly).
          Nothing here uses demographics or manager ratings — it's rule-based math on productivity, hours, cost, and a quality/error signal, and every
          input behind it is visible below. This is a decision-support signal, not an automated verdict.
        </p>
      </div>

      {scored.length === 0 ? (
        <p className="text-slate-500">No employees to score yet. Add employees on the Employees page first.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-1">Employees scored</p>
              <p className="num text-xl font-semibold text-white">{scored.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-1">Avg. confidence</p>
              <p className="num text-xl font-semibold text-white">{avgConfidence}%</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-1">Top 10% / Needs support</p>
              <p className="num text-xl font-semibold text-white">{bandCounts['Top 10%'] ?? 0} / {bandCounts['Needs Support'] ?? 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-1">On proxy data</p>
              <p className="num text-xl font-semibold text-white">{proxyCount}</p>
              {proxyCount > 0 && <p className="text-[11px] text-slate-600 mt-0.5">add output data to sharpen these</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {scored.map((card) => (
              <EmployeeCard key={card.id} card={card} onFlag={handleFlag} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
