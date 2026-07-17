/**
 * Sample data used by the "Fill with sample data" (onboarding) and
 * "Load sample data" (employees) buttons.
 *
 *  - Company: 3 internally-coherent fictional companies. Each click rolls a
 *    random one so the onboarding form feels alive.
 *  - Employees: 3 hand-tuned datasets of 10 distinct people (30 total).
 *    Each batch deliberately spans every performance band, every confidence
 *    level, every role archetype, and every data-completeness path the
 *    scoring engine handles, so the Intelligence page always has something
 *    real to show for every state.
 *
 * Employee dates are computed relative to today so tenure / ramp-curve
 * behavior always looks correct, no matter when this runs.
 */
import { Company, Employee } from './types';

// ---------------------------------------------------------------------------
// Company profiles
// ---------------------------------------------------------------------------

/** §min_cohort etc. live in performanceEngine.ts; these numbers are picked so
 *  runway, health score and hiring capacity all read sensibly for each firm. */
const COMPANY_PROFILES: Omit<Company, 'id'>[] = [
  {
    name: 'Northwind Retail Co',
    industry: 'Retail & E-commerce',
    country: 'United States',
    currency: 'USD',
    monthlyRevenue: 285000,
    cashBalance: 420000,
    monthlyOperatingExpenses: 96000,
    expectedRevenueGrowth: 14,
  },
  {
    name: 'Aperture Labs',
    industry: 'SaaS / B2B Software',
    country: 'United States',
    currency: 'USD',
    monthlyRevenue: 612000,
    cashBalance: 2100000,
    monthlyOperatingExpenses: 310000,
    expectedRevenueGrowth: 38,
  },
  {
    name: 'Granite & Co',
    industry: 'Creative Agency',
    country: 'United Kingdom',
    currency: 'GBP',
    monthlyRevenue: 148000,
    cashBalance: 95000,
    monthlyOperatingExpenses: 112000,
    expectedRevenueGrowth: 7,
  },
];

/** Return one of the three profiles, chosen at random each call. */
export function buildSampleCompany(): Omit<Company, 'id'> {
  return COMPANY_PROFILES[Math.floor(Math.random() * COMPANY_PROFILES.length)];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Employee datasets — three batches of 10, 30 unique people total.
//
// Design intent (matched across all three batches so the Intelligence page is
// always fully exercised): each batch contains —
//   • a clear Top-10% overachiever (high output, low errors, full data)
//   • a solid Above-Avg / On-Track moderate performer
//   • a ramp-up new hire (short tenure → ramp-curve discount + peer baseline)
//   • a high-error / quality-penalized case (pulls a strong raw score down)
//   • one proxy-data role (no output logged → revenue-proxy fallback, Low conf)
//   • coverage of all 4 archetypes (volume / transaction / service / support)
//   • coverage of all 4 employment statuses (full/part/contract/intern)
// ---------------------------------------------------------------------------

type SampleEmployee = Omit<Employee, 'id' | 'isActive'>;

const DATASET_A: SampleEmployee[] = [
  {
    name: 'Sarah Chen',
    department: 'Engineering',
    position: 'Senior Engineer',
    salary: 145000,
    joiningDate: daysAgo(820),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'transaction',
    outputLabel: 'shipped features',
    actualOutput: 9,
    expectedOutput: 7,
    outputUnitValue: 3200,
    errorCount: 0,
  },
  {
    name: 'Marcus Lee',
    department: 'Sales',
    position: 'Account Executive',
    salary: 98000,
    joiningDate: daysAgo(560),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'volume',
    outputLabel: 'deals closed',
    actualOutput: 14,
    expectedOutput: 10,
    outputUnitValue: 4200,
    errorCount: 1,
  },
  {
    name: 'Priya Patel',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 110000,
    joiningDate: daysAgo(980),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'support',
    outputLabel: 'campaigns launched',
    actualOutput: 5,
    expectedOutput: 5,
    outputUnitValue: 6000,
    errorCount: 0,
  },
  {
    name: 'Diego Ramirez',
    department: 'Engineering',
    position: 'Frontend Engineer',
    salary: 120000,
    joiningDate: daysAgo(45),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'transaction',
    outputLabel: 'shipped features',
    actualOutput: 3,
    expectedOutput: 7,
    outputUnitValue: 3200,
    errorCount: 0,
  },
  {
    name: 'Amara Okafor',
    department: 'Operations',
    position: 'Ops Lead',
    salary: 105000,
    joiningDate: daysAgo(670),
    workingHours: 32,
    employmentStatus: 'part_time',
    roleArchetype: 'transaction',
    outputLabel: 'orders processed',
    actualOutput: 430,
    expectedOutput: 360,
    outputUnitValue: 19,
    errorCount: 4,
  },
  {
    name: 'Tom Becker',
    department: 'Design',
    position: 'Product Designer',
    salary: 115000,
    joiningDate: daysAgo(390),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'support',
    outputLabel: 'designs shipped',
    actualOutput: 2,
    expectedOutput: 5,
    outputUnitValue: 5000,
    errorCount: 1,
  },
  {
    name: 'Jordan Kim',
    department: 'Support',
    position: 'Customer Support Rep',
    salary: 62000,
    joiningDate: daysAgo(310),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'service',
    outputLabel: 'tickets resolved',
    actualOutput: 210,
    expectedOutput: 180,
    outputUnitValue: 140,
    errorCount: 12,
  },
  {
    name: 'Elena Popescu',
    department: 'Finance',
    position: 'Loan Officer',
    salary: 88000,
    joiningDate: daysAgo(250),
    workingHours: 40,
    employmentStatus: 'contract',
    roleArchetype: 'transaction',
    outputLabel: 'loans processed',
    actualOutput: 34,
    expectedOutput: 34,
    outputUnitValue: 900,
    errorCount: 5,
  },
  {
    name: 'Wei Zhang',
    department: 'Sales',
    position: 'Sales Development Rep',
    salary: 52000,
    joiningDate: daysAgo(18),
    workingHours: 40,
    employmentStatus: 'intern',
    roleArchetype: 'volume',
    outputLabel: 'qualified leads',
    actualOutput: 11,
    expectedOutput: 28,
    outputUnitValue: 260,
    errorCount: 0,
  },
  {
    name: 'Noah Williams',
    department: 'People',
    position: 'HR Generalist',
    salary: 71000,
    joiningDate: daysAgo(730),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'support',
    // Deliberately no output fields — demonstrates the engine's graceful
    // proxy-data fallback for roles with no output logged yet.
  },
];

const DATASET_B: SampleEmployee[] = [
  {
    name: 'Aisha Khan',
    department: 'Sales',
    position: 'Senior Account Executive',
    salary: 128000,
    joiningDate: daysAgo(1100),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'volume',
    outputLabel: 'deals closed',
    actualOutput: 22,
    expectedOutput: 12,
    outputUnitValue: 8500,
    errorCount: 0,
  },
  {
    name: 'Lucas Moreau',
    department: 'Engineering',
    position: 'Backend Engineer',
    salary: 132000,
    joiningDate: daysAgo(720),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'transaction',
    outputLabel: 'shipped features',
    actualOutput: 7,
    expectedOutput: 7,
    outputUnitValue: 3400,
    errorCount: 2,
  },
  {
    name: 'Sofia Bianchi',
    department: 'Operations',
    position: 'Logistics Coordinator',
    salary: 58000,
    joiningDate: daysAgo(540),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'transaction',
    outputLabel: 'shipments fulfilled',
    actualOutput: 380,
    expectedOutput: 400,
    outputUnitValue: 22,
    errorCount: 9,
  },
  {
    name: 'Daniel Osei',
    department: 'Support',
    position: 'Support Specialist',
    salary: 56000,
    joiningDate: daysAgo(60),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'service',
    outputLabel: 'tickets resolved',
    actualOutput: 95,
    expectedOutput: 180,
    outputUnitValue: 140,
    errorCount: 3,
  },
  {
    name: 'Mei Lin',
    department: 'Marketing',
    position: 'Content Strategist',
    salary: 84000,
    joiningDate: daysAgo(410),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'support',
    outputLabel: 'assets published',
    actualOutput: 18,
    expectedOutput: 12,
    outputUnitValue: 1500,
    errorCount: 0,
  },
  {
    name: 'Carlos Mendez',
    department: 'Finance',
    position: 'Accounts Payable Clerk',
    salary: 60000,
    joiningDate: daysAgo(880),
    workingHours: 40,
    employmentStatus: 'contract',
    roleArchetype: 'transaction',
    outputLabel: 'invoices processed',
    actualOutput: 520,
    expectedOutput: 480,
    outputUnitValue: 12,
    errorCount: 18,
  },
  {
    name: 'Hannah Berg',
    department: 'Design',
    position: 'Junior Designer',
    salary: 64000,
    joiningDate: daysAgo(25),
    workingHours: 40,
    employmentStatus: 'intern',
    roleArchetype: 'support',
    outputLabel: 'designs shipped',
    actualOutput: 1,
    expectedOutput: 5,
    outputUnitValue: 5000,
    errorCount: 1,
  },
  {
    name: 'Raj Malhotra',
    department: 'Sales',
    position: 'Inside Sales Rep',
    salary: 70000,
    joiningDate: daysAgo(290),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'volume',
    outputLabel: 'deals closed',
    actualOutput: 9,
    expectedOutput: 10,
    outputUnitValue: 4200,
    errorCount: 2,
  },
  {
    name: 'Fatima Al-Rashid',
    department: 'Engineering',
    position: 'QA Engineer',
    salary: 95000,
    joiningDate: daysAgo(640),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'service',
    outputLabel: 'bugs verified',
    actualOutput: 160,
    expectedOutput: 150,
    outputUnitValue: 90,
    errorCount: 6,
  },
  {
    name: 'Greg Thompson',
    department: 'People',
    position: 'Recruiter',
    salary: 78000,
    joiningDate: daysAgo(500),
    workingHours: 24,
    employmentStatus: 'part_time',
    roleArchetype: 'support',
    // No output fields — proxy-data fallback (Low confidence) demonstration.
  },
];

const DATASET_C: SampleEmployee[] = [
  {
    name: 'Ingrid Nilsson',
    department: 'Engineering',
    position: 'Staff Engineer',
    salary: 175000,
    joiningDate: daysAgo(1450),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'transaction',
    outputLabel: 'shipped features',
    actualOutput: 11,
    expectedOutput: 7,
    outputUnitValue: 3600,
    errorCount: 1,
  },
  {
    name: 'Omar Haddad',
    department: 'Sales',
    position: 'VP of Sales',
    salary: 165000,
    joiningDate: daysAgo(990),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'volume',
    outputLabel: 'deals closed',
    actualOutput: 18,
    expectedOutput: 9,
    outputUnitValue: 12000,
    errorCount: 0,
  },
  {
    name: 'Yuki Tanaka',
    department: 'Operations',
    position: 'Procurement Analyst',
    salary: 72000,
    joiningDate: daysAgo(330),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'transaction',
    outputLabel: 'contracts negotiated',
    actualOutput: 28,
    expectedOutput: 30,
    outputUnitValue: 700,
    errorCount: 2,
  },
  {
    name: 'Liam O\'Brien',
    department: 'Support',
    position: 'Tier-2 Support Lead',
    salary: 74000,
    joiningDate: daysAgo(760),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'service',
    outputLabel: 'tickets resolved',
    actualOutput: 245,
    expectedOutput: 200,
    outputUnitValue: 155,
    errorCount: 7,
  },
  {
    name: 'Zara Ahmed',
    department: 'Marketing',
    position: 'Growth Marketer',
    salary: 96000,
    joiningDate: daysAgo(120),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'volume',
    outputLabel: 'experiments run',
    actualOutput: 6,
    expectedOutput: 8,
    outputUnitValue: 4500,
    errorCount: 1,
  },
  {
    name: 'Viktor Petrov',
    department: 'Engineering',
    position: 'DevOps Engineer',
    salary: 138000,
    joiningDate: daysAgo(580),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'service',
    outputLabel: 'deployments shipped',
    actualOutput: 42,
    expectedOutput: 38,
    outputUnitValue: 480,
    errorCount: 14,
  },
  {
    name: 'Chloe Dubois',
    department: 'Design',
    position: 'Design Director',
    salary: 148000,
    joiningDate: daysAgo(1220),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'support',
    outputLabel: 'designs shipped',
    actualOutput: 4,
    expectedOutput: 5,
    outputUnitValue: 9000,
    errorCount: 0,
  },
  {
    name: 'Andre Costa',
    department: 'Finance',
    position: 'Junior Accountant',
    salary: 54000,
    joiningDate: daysAgo(35),
    workingHours: 40,
    employmentStatus: 'intern',
    roleArchetype: 'transaction',
    outputLabel: 'entries reconciled',
    actualOutput: 120,
    expectedOutput: 300,
    outputUnitValue: 8,
    errorCount: 8,
  },
  {
    name: 'Nadia Volkov',
    department: 'Operations',
    position: 'Office Manager',
    salary: 68000,
    joiningDate: daysAgo(450),
    workingHours: 40,
    employmentStatus: 'full_time',
    roleArchetype: 'support',
    outputLabel: 'facilities requests closed',
    actualOutput: 60,
    expectedOutput: 55,
    outputUnitValue: 180,
    errorCount: 3,
  },
  {
    name: 'Bryan Wright',
    department: 'People',
    position: 'L&D Coordinator',
    salary: 66000,
    joiningDate: daysAgo(380),
    workingHours: 40,
    employmentStatus: 'contract',
    roleArchetype: 'support',
    // No output fields — proxy-data fallback (Low confidence) demonstration.
  },
];

/** The three datasets, in load order. (Index 0 is the first batch loaded.) */
export const SAMPLE_EMPLOYEE_DATASETS: SampleEmployee[][] = [DATASET_A, DATASET_B, DATASET_C];

/** Backwards-compatible single batch — returns the first dataset. Callers that
 *  only want one batch (without the cycle/cap UI) can still use this. */
export function buildSampleEmployees(): SampleEmployee[] {
  return DATASET_A;
}
