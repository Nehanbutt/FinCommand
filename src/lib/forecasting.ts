/**
 * Financial forecasting using growth-rate modeling.
 * Ported from services/forecasting.py — the original never actually used
 * scikit-learn's regressor at runtime, so nothing of substance is lost here.
 */
import { Company, Employee, Snapshot } from './types';
import { calculatePayroll } from './analytics';

const round = (n: number, d = 2) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

export function forecastFinancials(
  company: Company,
  employees: Employee[],
  snapshots: Snapshot[],
  months = 12
) {
  const now = new Date();
  const active = employees.filter((e) => e.isActive);
  const currentPayroll = calculatePayroll(active);
  let growthRate = company.expectedRevenueGrowth / 100 / 12;

  let baseRevenue: number, basePayroll: number, baseOpex: number;

  if (snapshots.length >= 3) {
    const sorted = [...snapshots].sort((a, b) => (a.year - b.year) || (a.month - b.month)).slice(-12);
    const revenues = sorted.map((s) => s.revenue);
    baseRevenue = revenues[revenues.length - 1];
    basePayroll = sorted[sorted.length - 1].payroll;
    baseOpex = sorted[sorted.length - 1].operatingExpenses;
    if (revenues.length > 1) {
      growthRate = Math.pow(revenues[revenues.length - 1] / revenues[0], 1 / revenues.length) - 1;
    }
  } else {
    baseRevenue = company.monthlyRevenue;
    basePayroll = currentPayroll;
    baseOpex = company.monthlyOperatingExpenses;
  }

  const payrollGrowth = 0.003; // ~3.6% annual payroll growth
  const opexGrowth = 0.002;

  const forecast = [];
  for (let i = 1; i <= months; i++) {
    const dt = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
    const rev = baseRevenue * Math.pow(1 + growthRate, i);
    const pay = basePayroll * Math.pow(1 + payrollGrowth, i);
    const opex = baseOpex * Math.pow(1 + opexGrowth, i);
    const profit = rev - pay - opex;

    let cashDelta = 0;
    for (let j = 1; j <= i; j++) {
      cashDelta +=
        baseRevenue * Math.pow(1 + growthRate, j) -
        basePayroll * Math.pow(1 + payrollGrowth, j) -
        baseOpex * Math.pow(1 + opexGrowth, j);
    }
    const cash = company.cashBalance + cashDelta;
    const confidence = Math.max(0.5, 0.95 - (i - 1) * 0.04);

    forecast.push({
      month: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`,
      revenue: round(rev),
      payroll: round(pay),
      operating_expenses: round(opex),
      net_profit: round(profit),
      cash_balance: round(Math.max(0, cash)),
      confidence: round(confidence),
    });
  }

  const summary = {
    '1_month': months >= 1 ? forecast[0] : null,
    '3_months': months >= 3 ? forecast[2] : null,
    '6_months': months >= 6 ? forecast[5] : null,
    '12_months': months >= 12 ? forecast[11] : null,
  };

  return {
    forecast,
    summary,
    growth_rate_monthly: round(growthRate * 100, 3),
  };
}
