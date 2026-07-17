'use client';

import { useMemo } from 'react';
import { DollarSign, TrendingDown, Users, Wallet, UserPlus, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  calculateKpis, calculateHealthScore, calculateDepartmentBreakdown,
  generateSmartInsights, generateRecommendations, buildTrendData, calculateHiringCapacity,
} from '@/lib/analytics';
import { KPICard } from '@/components/KPICard';
import { HealthScore } from '@/components/HealthScore';
import { SmartInsights } from '@/components/SmartInsights';
import { TrendChart, DepartmentChart } from '@/components/Charts';

export default function DashboardPage() {
  const { company, employees, snapshots } = useStore();

  const data = useMemo(() => {
    if (!company) return null;
    return {
      kpis: calculateKpis(company, employees),
      health: calculateHealthScore(company, employees),
      insights: generateSmartInsights(company, employees),
      departments: calculateDepartmentBreakdown(employees),
      trend: buildTrendData(company, employees, snapshots),
      recommendations: generateRecommendations(company, employees),
      hiring: calculateHiringCapacity(company, employees),
    };
  }, [company, employees, snapshots]);

  if (!company || !data) return null;

  const currency = company.currency;
  const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">{company.name}</h1>
        <p className="text-sm text-slate-500">{company.industry} · Financial overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <KPICard label="Monthly revenue" value={fmt(data.kpis.revenue)} icon={DollarSign} accent="#4C8CFF" />
        <KPICard label="Net profit" value={fmt(data.kpis.net_profit)} sub={`${data.kpis.profit_margin}% margin`} icon={TrendingDown} accent="#3DDC97" />
        <KPICard label="Cash runway" value={`${data.kpis.cash_runway_months} mo`} icon={Wallet} accent="#E8A33D" />
        <KPICard label="Team size" value={`${data.kpis.employee_count}`} sub={`${fmt(data.kpis.avg_salary_monthly)}/mo avg`} icon={Users} accent="#8B5CF6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <HealthScore health={data.health} />
        <SmartInsights insights={data.insights} />
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Hiring capacity</p>
          {data.hiring.capacity > 0 ? (
            <UserPlus size={16} className="text-emerald-400" />
          ) : (
            <Clock size={16} className="text-amber-400" />
          )}
        </div>
        {data.hiring.capacity > 0 ? (
          <>
            <p className="text-2xl font-semibold text-white num mb-1">
              You can afford {data.hiring.capacity} more hire{data.hiring.capacity > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-slate-400">
              At your team's current average cost of {fmt(data.hiring.avg_monthly_cost)}/mo, while keeping payroll
              under 45% of revenue and holding 6 months of cash in reserve.
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-white num mb-1">Not affordable yet</p>
            <p className="text-sm text-slate-400">
              {data.hiring.binding_constraint === 'cash'
                ? "Cash reserves wouldn't cover 6 months of payroll at your average hire cost — build reserves before adding headcount."
                : data.hiring.months_to_next_hire
                  ? `At your team's current average cost and expected growth rate, you're roughly ${data.hiring.months_to_next_hire} month${data.hiring.months_to_next_hire > 1 ? 's' : ''} away from affording one more hire.`
                  : "Payroll is already above the healthy 45%-of-revenue threshold — grow revenue or reduce costs before adding headcount."}
            </p>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><TrendChart data={data.trend} /></div>
        <DepartmentChart data={data.departments} />
      </div>

      {data.recommendations.length > 0 && (
        <div className="card p-6">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">Recommendations</p>
          <div className="grid md:grid-cols-2 gap-4">
            {data.recommendations.map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="badge" style={{ background: r.priority === 'high' ? '#E8555A1f' : r.priority === 'medium' ? '#E8A33D1f' : '#4C8CFF1f', color: r.priority === 'high' ? '#E8555A' : r.priority === 'medium' ? '#E8A33D' : '#4C8CFF' }}>
                    {r.category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white mb-1">{r.title}</p>
                <p className="text-sm text-slate-400 leading-snug">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
