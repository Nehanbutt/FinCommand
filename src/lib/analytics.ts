/**
 * Core analytics engine: transforms raw company/employee data into 100+ insights.
 * Ported 1:1 from the original Python (services/analytics.py) — same formulas,
 * same thresholds, same output shape, now running in-process with the UI.
 */
import { Company, Employee, Snapshot } from './types';

const round = (n: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

export function calculatePayroll(employees: Employee[]): number {
  return employees.filter((e) => e.isActive).reduce((sum, e) => sum + e.salary / 12, 0);
}

/**
 * Hiring capacity: how many people can this company actually afford to hire
 * right now, at its own current average salary, without breaking either of
 * two independent constraints —
 *
 *   1. Revenue constraint — payroll should stay under the healthy 45%-of-revenue
 *      ratio used everywhere else in this app (see generateRecommendations).
 *   2. Cash constraint — even if new revenue never materializes, the company
 *      should still be able to cover 6 months of the *new, larger* payroll
 *      out of cash on hand alone.
 *
 * The binding (smaller) constraint wins. If capacity is zero today, we project
 * forward using the company's own expected growth rate to estimate when the
 * revenue constraint will loosen enough to afford one more hire.
 */
export function calculateHiringCapacity(company: Company, employees: Employee[]) {
  const HEALTHY_PAYROLL_RATIO = 0.45;
  const CASH_BUFFER_MONTHS = 6;

  const active = employees.filter((e) => e.isActive);
  const currentPayroll = calculatePayroll(active);
  const revenue = company.monthlyRevenue;
  const opex = company.monthlyOperatingExpenses;
  const cash = company.cashBalance;

  const avgAnnualSalary = active.length
    ? active.reduce((s, e) => s + e.salary, 0) / active.length
    : revenue > 0 ? revenue * 0.25 * 12 : 60000; // sane fallback for an empty roster
  const avgMonthlyCost = avgAnnualSalary / 12;

  // Constraint 1 — revenue
  const maxHealthyPayroll = revenue * HEALTHY_PAYROLL_RATIO;
  const payrollHeadroom = Math.max(0, maxHealthyPayroll - currentPayroll);
  const hiresByRevenue = avgMonthlyCost > 0 ? Math.floor(payrollHeadroom / avgMonthlyCost) : 0;

  // Constraint 2 — cash buffer, assuming zero new revenue ever shows up
  const currentBurn = currentPayroll + opex - revenue; // negative = profitable
  const cashAfterBuffer = Math.max(0, cash - Math.max(0, currentBurn) * CASH_BUFFER_MONTHS);
  const hiresByCash = avgMonthlyCost > 0
    ? Math.floor(cashAfterBuffer / (avgMonthlyCost * CASH_BUFFER_MONTHS))
    : 0;

  const capacity = Math.max(0, Math.min(hiresByRevenue, hiresByCash));
  const bindingConstraint: 'revenue' | 'cash' | null =
    capacity === 0 ? (hiresByRevenue <= hiresByCash ? 'revenue' : 'cash') : null;

  // If nothing is affordable today, project months-to-next-hire using the
  // company's own stated expected annual growth rate.
  let monthsToNextHire: number | null = null;
  if (capacity === 0 && bindingConstraint === 'revenue') {
    const neededRevenue = (currentPayroll + avgMonthlyCost) / HEALTHY_PAYROLL_RATIO;
    const monthlyGrowth = company.expectedRevenueGrowth / 100 / 12;
    if (revenue > 0 && monthlyGrowth > 0 && neededRevenue > revenue) {
      monthsToNextHire = Math.ceil(Math.log(neededRevenue / revenue) / Math.log(1 + monthlyGrowth));
    }
  }

  return {
    capacity,
    avg_monthly_cost: round(avgMonthlyCost, 0),
    binding_constraint: bindingConstraint,
    hires_by_revenue: hiresByRevenue,
    hires_by_cash: hiresByCash,
    months_to_next_hire: monthsToNextHire,
    payroll_headroom: round(payrollHeadroom, 0),
  };
}

export function calculateHealthScore(company: Company, employees: Employee[]) {
  const payroll = calculatePayroll(employees);
  const revenue = company.monthlyRevenue;
  const opex = company.monthlyOperatingExpenses;
  const cash = company.cashBalance;
  const growth = company.expectedRevenueGrowth;

  const totalExpenses = payroll + opex;
  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const payrollRatio = revenue > 0 ? (payroll / revenue) * 100 : 100;
  const burnRate = totalExpenses > revenue ? totalExpenses - revenue : 0;
  const cashRunway =
    totalExpenses - revenue > 0
      ? cash / Math.abs(totalExpenses - revenue) // burning cash: runway = cash / net monthly burn
      : totalExpenses > 0
        ? cash / totalExpenses // profitable: runway = cash / monthly expenses (matches KPIs & insights)
        : 999;

  const scores: Record<string, number> = {};

  if (profitMargin >= 20) scores.profitability = 25;
  else if (profitMargin >= 10) scores.profitability = 20;
  else if (profitMargin >= 5) scores.profitability = 15;
  else if (profitMargin >= 0) scores.profitability = 10;
  else scores.profitability = Math.max(0, Math.round(10 + profitMargin));

  const monthsRunway = Math.min(cashRunway, 24);
  scores.liquidity = Math.min(20, Math.floor((monthsRunway / 24) * 20));

  if (payrollRatio <= 30) scores.payroll_ratio = 20;
  else if (payrollRatio <= 40) scores.payroll_ratio = 16;
  else if (payrollRatio <= 50) scores.payroll_ratio = 12;
  else if (payrollRatio <= 60) scores.payroll_ratio = 8;
  else scores.payroll_ratio = Math.max(0, Math.floor(20 - (payrollRatio - 30) / 5));

  if (growth >= 20) scores.revenue_growth = 20;
  else if (growth >= 10) scores.revenue_growth = 16;
  else if (growth >= 5) scores.revenue_growth = 12;
  else if (growth >= 0) scores.revenue_growth = 8;
  else scores.revenue_growth = 0;

  const expenseRatio = revenue > 0 ? (opex / revenue) * 100 : 100;
  if (expenseRatio <= 20) scores.expense_control = 15;
  else if (expenseRatio <= 30) scores.expense_control = 12;
  else if (expenseRatio <= 40) scores.expense_control = 8;
  else scores.expense_control = Math.max(0, Math.floor(15 - expenseRatio / 10));

  const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0));

  let label: string, color: string;
  if (total >= 85) { label = 'Excellent'; color = '#3DDC97'; }
  else if (total >= 70) { label = 'Healthy'; color = '#4C8CFF'; }
  else if (total >= 55) { label = 'Stable'; color = '#E8A33D'; }
  else if (total >= 35) { label = 'Needs Attention'; color = '#F97316'; }
  else { label = 'Critical'; color = '#E8555A'; }

  const reasons: string[] = [];
  if (scores.profitability >= 20) reasons.push(`Strong profit margin of ${profitMargin.toFixed(1)}%`);
  else if (scores.profitability < 10) reasons.push(`Low profit margin (${profitMargin.toFixed(1)}%) is dragging the score`);

  if (cashRunway >= 12) reasons.push(`Healthy cash runway of ${cashRunway.toFixed(0)} months`);
  else if (cashRunway < 6) reasons.push(`Cash runway of only ${cashRunway.toFixed(0)} months is a concern`);

  if (payrollRatio > 50) reasons.push(`Payroll consumes ${payrollRatio.toFixed(1)}% of revenue — above the 50% threshold`);
  else if (payrollRatio <= 30) reasons.push(`Efficient payroll ratio of ${payrollRatio.toFixed(1)}%`);

  if (growth >= 10) reasons.push(`Revenue growth of ${growth.toFixed(1)}% is excellent`);
  else if (growth < 0) reasons.push(`Negative revenue growth (${growth.toFixed(1)}%) reduces the score`);

  return {
    score: total,
    label,
    color,
    breakdown: scores,
    reasons,
    metrics: {
      profit_margin: round(profitMargin),
      payroll_ratio: round(payrollRatio),
      cash_runway_months: round(Math.min(cashRunway, 999)),
      burn_rate: round(burnRate),
    },
  };
}

export function calculateKpis(company: Company, employees: Employee[]) {
  const active = employees.filter((e) => e.isActive);
  const payroll = calculatePayroll(active);
  const revenue = company.monthlyRevenue;
  const opex = company.monthlyOperatingExpenses;
  const cash = company.cashBalance;
  const totalExpenses = payroll + opex;
  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const payrollRatio = revenue > 0 ? (payroll / revenue) * 100 : 0;
  const revenuePerEmp = active.length ? revenue / active.length : 0;
  const avgSalaryMonthly = active.length ? active.reduce((s, e) => s + e.salary, 0) / 12 / active.length : 0;
  const burnRate = Math.max(0, totalExpenses - revenue);
  const cashRunway = totalExpenses > 0 ? cash / totalExpenses : 999;

  return {
    revenue: round(revenue),
    payroll: round(payroll),
    operating_expenses: round(opex),
    total_expenses: round(totalExpenses),
    net_profit: round(netProfit),
    profit_margin: round(profitMargin),
    cash_balance: round(cash),
    burn_rate: round(burnRate),
    cash_runway_months: round(Math.min(cashRunway, 999)),
    employee_count: active.length,
    avg_salary_annual: active.length ? round(active.reduce((s, e) => s + e.salary, 0) / active.length) : 0,
    avg_salary_monthly: round(avgSalaryMonthly),
    revenue_per_employee: round(revenuePerEmp),
    payroll_ratio: round(payrollRatio),
  };
}

export function calculateDepartmentBreakdown(employees: Employee[]) {
  const active = employees.filter((e) => e.isActive);
  const deptData: Record<string, { name: string; employee_count: number; total_payroll: number }> = {};
  for (const e of active) {
    const d = e.department;
    if (!deptData[d]) deptData[d] = { name: d, employee_count: 0, total_payroll: 0 };
    deptData[d].employee_count += 1;
    deptData[d].total_payroll += e.salary / 12;
  }
  const totalPayroll = Object.values(deptData).reduce((s, d) => s + d.total_payroll, 0);
  const result = Object.values(deptData).map((d) => ({
    name: d.name,
    employee_count: d.employee_count,
    monthly_payroll: round(d.total_payroll),
    avg_monthly_salary: round(d.employee_count ? d.total_payroll / d.employee_count : 0),
    payroll_share: totalPayroll > 0 ? round((d.total_payroll / totalPayroll) * 100) : 0,
  }));
  return result.sort((a, b) => b.monthly_payroll - a.monthly_payroll);
}

export function generateSmartInsights(company: Company, employees: Employee[]) {
  const active = employees.filter((e) => e.isActive);
  const payroll = calculatePayroll(active);
  const revenue = company.monthlyRevenue;
  const opex = company.monthlyOperatingExpenses;
  const cash = company.cashBalance;
  const growth = company.expectedRevenueGrowth;
  const total = payroll + opex;
  const profit = revenue - total;
  const deptData = calculateDepartmentBreakdown(active);
  const insights: { type: string; icon: string; title: string; message: string }[] = [];

  const ratio = revenue > 0 ? (payroll / revenue) * 100 : 0;
  if (ratio > 50) {
    insights.push({ type: 'warning', icon: 'alert', title: 'High Payroll Burden', message: `Payroll consumes ${ratio.toFixed(1)}% of monthly revenue — above the recommended 50% threshold. Consider revenue growth strategies before making new hires.` });
  } else if (ratio > 35) {
    insights.push({ type: 'info', icon: 'info', title: 'Payroll Ratio Trending Up', message: `Payroll accounts for ${ratio.toFixed(1)}% of revenue. This is manageable but worth monitoring as headcount grows.` });
  } else {
    insights.push({ type: 'success', icon: 'check', title: 'Efficient Payroll Ratio', message: `Payroll is only ${ratio.toFixed(1)}% of revenue — well within healthy limits. You have room to hire or invest.` });
  }

  const cashRunway = total > 0 ? cash / total : 999;
  if (cashRunway < 3) {
    insights.push({ type: 'danger', icon: 'alert-triangle', title: 'Critical Cash Runway', message: `At current burn rate, cash reserves will last only ${cashRunway.toFixed(1)} months. Immediate action required.` });
  } else if (cashRunway < 6) {
    insights.push({ type: 'warning', icon: 'clock', title: 'Low Cash Runway', message: `Current cash can sustain operations for ${cashRunway.toFixed(1)} months. Plan for revenue growth or cost reduction.` });
  } else {
    insights.push({ type: 'success', icon: 'shield', title: 'Solid Cash Runway', message: `Cash reserves can sustain operations for ${cashRunway.toFixed(1)} months, providing a healthy financial cushion.` });
  }

  if (deptData.length) {
    const topDept = deptData[0];
    if (topDept.payroll_share > 45) {
      insights.push({ type: 'info', icon: 'pie-chart', title: 'Department Concentration', message: `${topDept.name} accounts for ${topDept.payroll_share}% of total payroll. This concentration may create operational risk.` });
    }
  }

  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  if (profitMargin < 0) {
    insights.push({ type: 'danger', icon: 'trending-down', title: 'Operating at a Loss', message: `Monthly expenses exceed revenue by ${Math.abs(profit).toLocaleString()} ${company.currency}. Immediate cost review is critical.` });
  } else if (profitMargin < 10) {
    insights.push({ type: 'warning', icon: 'trending-up', title: 'Thin Profit Margins', message: `Net profit margin of ${profitMargin.toFixed(1)}% leaves little buffer for unexpected expenses.` });
  } else {
    insights.push({ type: 'success', icon: 'trending-up', title: 'Healthy Profit Margins', message: `Net profit margin of ${profitMargin.toFixed(1)}% indicates strong financial health.` });
  }

  if (growth >= 15) {
    insights.push({ type: 'success', icon: 'rocket', title: 'Strong Revenue Trajectory', message: `Expected revenue growth of ${growth.toFixed(1)}% annually puts the company on an excellent growth path.` });
  } else if (growth < 5) {
    insights.push({ type: 'warning', icon: 'target', title: 'Revenue Growth Needs Attention', message: `Expected growth of ${growth.toFixed(1)}% may not keep pace with rising operating costs over time.` });
  }

  if (active.length) {
    const revPerEmp = revenue / active.length;
    const avgSal = active.reduce((s, e) => s + e.salary, 0) / active.length / 12;
    if (revPerEmp < avgSal * 2) {
      insights.push({ type: 'warning', icon: 'users', title: 'Revenue Per Employee Low', message: `Each employee generates ${revPerEmp.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${company.currency}/month in revenue vs ${avgSal.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${company.currency} cost. Target 3-5x for healthy margins.` });
    }
  }

  const avgMonthlyCost = active.length ? payroll / active.length : 5000;
  const newProfit = revenue - (payroll + avgMonthlyCost + opex);
  if (newProfit > 0) {
    insights.push({ type: 'info', icon: 'user-plus', title: 'Hiring Capacity Available', message: `Current financials can support one additional hire at the average salary of ${avgMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month while remaining profitable.` });
  }

  return insights;
}

export function generateRecommendations(company: Company, employees: Employee[]) {
  const active = employees.filter((e) => e.isActive);
  const payroll = calculatePayroll(active);
  const revenue = company.monthlyRevenue;
  const opex = company.monthlyOperatingExpenses;
  const cash = company.cashBalance;
  const total = payroll + opex;
  const profit = revenue - total;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const payrollRatio = revenue > 0 ? (payroll / revenue) * 100 : 0;
  const cashRunway = total > 0 ? cash / total : 999;
  const avgCost = active.length ? payroll / active.length : 5000;

  const recs: { priority: string; category: string; title: string; description: string; impact: string; icon: string }[] = [];

  if (payrollRatio > 50) {
    const targetRevenue = payroll / 0.45;
    const increasePct = ((targetRevenue - revenue) / revenue) * 100;
    recs.push({ priority: 'high', category: 'Revenue', title: 'Increase Revenue to Reduce Payroll Burden', description: `Growing monthly revenue by ${increasePct.toFixed(0)}% (to ${targetRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${company.currency}) would bring payroll ratio to the healthy 45% threshold.`, impact: 'High', icon: 'trending-up' });
  }

  if (cashRunway < 6) {
    const monthsTarget = 12;
    const cashNeeded = total * monthsTarget - cash;
    recs.push({ priority: 'high', category: 'Cash Management', title: 'Build Cash Reserves', description: `Targeting ${monthsTarget} months of cash runway requires an additional ${cashNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${company.currency} in reserves.`, impact: 'High', icon: 'shield' });
  }

  if (profitMargin < 15 && opex > revenue * 0.25) {
    const reduction = opex * 0.08;
    recs.push({ priority: 'medium', category: 'Cost Control', title: 'Optimize Operating Expenses', description: `Reducing operating expenses by 8% (${reduction.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${company.currency}/month) would improve profit margins by approximately 2-3 percentage points.`, impact: 'Medium', icon: 'scissors' });
  }

  const hiring = calculateHiringCapacity(company, active);
  if (hiring.capacity > 0) {
    recs.push({ priority: 'low', category: 'Hiring', title: `You Can Afford ${hiring.capacity} More Hire${hiring.capacity > 1 ? 's' : ''}`, description: `At your team's current average cost (${hiring.avg_monthly_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${company.currency}/month), financial health supports ${hiring.capacity} more hire${hiring.capacity > 1 ? 's' : ''} while keeping payroll under 45% of revenue and 6 months of cash in reserve.`, impact: 'Medium', icon: 'user-plus' });
  } else if (hiring.months_to_next_hire) {
    recs.push({ priority: 'low', category: 'Hiring', title: 'Not Yet Ready to Hire', description: `At your current average cost and expected growth rate, revenue needs roughly ${hiring.months_to_next_hire} more month${hiring.months_to_next_hire > 1 ? 's' : ''} to sustainably support one additional hire.`, impact: 'Low', icon: 'user-plus' });
  }

  if (company.expectedRevenueGrowth < 5) {
    recs.push({ priority: 'medium', category: 'Growth', title: 'Boost Revenue Growth Strategy', description: `Current expected growth of ${company.expectedRevenueGrowth.toFixed(1)}% may be insufficient to offset rising costs. A target of 10%+ annual growth provides a stronger financial buffer.`, impact: 'High', icon: 'rocket' });
  }

  if (profitMargin > 20 && cashRunway > 12) {
    recs.push({ priority: 'low', category: 'Investment', title: 'Deploy Excess Capital', description: 'Strong financial position provides an opportunity to invest in growth — technology upgrades, marketing, or strategic partnerships.', impact: 'Medium', icon: 'zap' });
  }

  return recs;
}

export function buildTrendData(company: Company, employees: Employee[], snapshots: Snapshot[]) {
  const now = new Date();
  const months: any[] = [];

  if (snapshots.length >= 3) {
    const sorted = [...snapshots].sort((a, b) => (a.year - b.year) || (a.month - b.month)).slice(-12);
    for (const s of sorted) {
      const profit = s.revenue - s.payroll - s.operatingExpenses;
      months.push({
        month: `${s.year}-${String(s.month).padStart(2, '0')}`,
        revenue: s.revenue,
        payroll: s.payroll,
        operating_expenses: s.operatingExpenses,
        net_profit: profit,
        cash_balance: s.cashBalance,
        employee_count: s.employeeCount,
      });
    }
  } else {
    const growthRate = company.expectedRevenueGrowth / 100 / 12;
    const currentPayroll = calculatePayroll(employees.filter((e) => e.isActive));
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
      const factor = 1 / Math.pow(1 + growthRate, i);
      const rev = company.monthlyRevenue * factor;
      const pay = currentPayroll * factor;
      const opex = company.monthlyOperatingExpenses * factor;
      months.push({
        month: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`,
        revenue: round(rev),
        payroll: round(pay),
        operating_expenses: round(opex),
        net_profit: round(rev - pay - opex),
        cash_balance: round(company.cashBalance * factor),
        employee_count: employees.filter((e) => e.isActive).length,
      });
    }
  }

  return months;
}

export function runScenario(company: Company, employees: Employee[], params: {
  revenue_growth_delta?: number;
  salary_increase?: number;
  new_hires?: number;
  avg_new_hire_salary?: number | null;
  operating_expense_change?: number;
}) {
  const active = employees.filter((e) => e.isActive);
  const revenueGrowthDelta = params.revenue_growth_delta ?? 0;
  const salaryIncrease = params.salary_increase ?? 0;
  const newHires = params.new_hires ?? 0;
  const avgNewHireSalary = params.avg_new_hire_salary || (active.length ? active.reduce((s, e) => s + e.salary, 0) / active.length : 60000);
  const opexChange = params.operating_expense_change ?? 0;

  const simRevenue = company.monthlyRevenue * (1 + revenueGrowthDelta / 100);
  const simPayroll = calculatePayroll(active) * (1 + salaryIncrease / 100) + (newHires * avgNewHireSalary) / 12;
  const simOpex = company.monthlyOperatingExpenses * (1 + opexChange / 100);
  const simTotal = simPayroll + simOpex;
  const simProfit = simRevenue - simTotal;
  const simMargin = simRevenue > 0 ? (simProfit / simRevenue) * 100 : 0;
  const simPayrollRatio = simRevenue > 0 ? (simPayroll / simRevenue) * 100 : 0;
  const simCashRunway = simTotal > 0 ? company.cashBalance / simTotal : 999;

  const simCompany: Company = {
    ...company,
    monthlyRevenue: simRevenue,
    monthlyOperatingExpenses: simOpex,
    expectedRevenueGrowth: company.expectedRevenueGrowth + revenueGrowthDelta,
  };
  const simEmployees: Employee[] = [
    ...active.map((e) => ({ ...e, salary: e.salary * (1 + salaryIncrease / 100) })),
    ...Array.from({ length: newHires }, (_, i) => ({
      ...active[0],
      id: -1 - i,
      salary: avgNewHireSalary,
      isActive: true,
    } as Employee)),
  ];
  const simHealth = calculateHealthScore(simCompany, simEmployees);

  const baselinePayroll = calculatePayroll(active);
  const baselineProfit = company.monthlyRevenue - baselinePayroll - company.monthlyOperatingExpenses;

  return {
    simulated: {
      revenue: round(simRevenue),
      payroll: round(simPayroll),
      operating_expenses: round(simOpex),
      net_profit: round(simProfit),
      profit_margin: round(simMargin),
      payroll_ratio: round(simPayrollRatio),
      cash_runway_months: round(Math.min(simCashRunway, 999)),
      health_score: simHealth.score,
      health_label: simHealth.label,
      employee_count: active.length + newHires,
    },
    delta: {
      revenue: round(simRevenue - company.monthlyRevenue),
      payroll: round(simPayroll - baselinePayroll),
      net_profit: round(simProfit - baselineProfit),
    },
  };
}
