/**
 * Domain types for the app's data. Previously these lived in src/lib/db.ts
 * next to a database layer; now that all storage is client-side (browser),
 * they live here on their own and src/store/useStore.ts is the only thing
 * that reads/writes them.
 */
export type EmploymentStatus = 'full_time' | 'part_time' | 'contract' | 'intern';

export interface Company {
  id: number;
  name: string;
  industry: string;
  country: string;
  currency: string;
  monthlyRevenue: number;
  cashBalance: number;
  monthlyOperatingExpenses: number;
  expectedRevenueGrowth: number;
}

/**
 * Role archetypes used by the performance engine (src/lib/performanceEngine.ts)
 * to pick sensible weight tilts and interpret the output metric correctly.
 */
export type RoleArchetype = 'volume' | 'transaction' | 'service' | 'support';

export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  salary: number;
  joiningDate: string;
  workingHours: number;
  employmentStatus: EmploymentStatus;
  isActive: boolean;

  // --- Performance scoring inputs (all optional — the engine degrades
  // gracefully and flags lower confidence when these are missing, it never
  // breaks). See src/lib/performanceEngine.ts. ---

  /** Which output pattern this role follows — drives scoring weight tilt. */
  roleArchetype?: RoleArchetype;
  /** Human label for what "output" means for this role, e.g. "deals closed". */
  outputLabel?: string;
  /** Actual output produced this period (the one role-specific KPI). */
  actualOutput?: number;
  /** Full-proficiency expected output for this period. Blank = derive from peers. */
  expectedOutput?: number;
  /** $ value of one unit of output (e.g. avg deal size). Blank = derive from company revenue. */
  outputUnitValue?: number;
  /** Errors / rework / reversals / reopens this period — the anti-gaming signal. */
  errorCount?: number;

  /** Lightweight exception-based manager sanity check for outlier scores only. */
  reviewFlag?: 'confirmed' | 'disputed' | null;
  reviewNote?: string;
}

export interface Snapshot {
  id: number;
  month: number;
  year: number;
  revenue: number;
  payroll: number;
  operatingExpenses: number;
  cashBalance: number;
  employeeCount: number;
}
