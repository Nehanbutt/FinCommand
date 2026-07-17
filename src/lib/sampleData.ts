/**
 * Sample data used by the "Fill with sample data" (onboarding) and
 * "Load sample data" (employees) buttons. Employee dates are computed
 * relative to today so tenure/ramp-curve behavior always looks correct,
 * no matter when this runs.
 */
import { Company, Employee } from './types';

export function buildSampleCompany(): Omit<Company, 'id'> {
  return {
    name: 'Meridian Retail Co',
    industry: 'Retail & E-commerce',
    country: 'United States',
    currency: 'USD',
    monthlyRevenue: 285000,
    cashBalance: 420000,
    monthlyOperatingExpenses: 96000,
    expectedRevenueGrowth: 14,
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/**
 * Ten employees deliberately spanning every archetype, every employment
 * status, and every data-completeness path the scoring engine handles —
 * complete data, peer-baseline fallback, quality penalties, ramp-curve
 * new hires, and the no-output-data proxy fallback — so the Intelligence
 * page always has something real to show for every state.
 */
export function buildSampleEmployees(): Omit<Employee, 'id' | 'isActive'>[] {
  return [
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
}
