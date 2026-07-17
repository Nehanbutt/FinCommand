'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { runScenario } from '@/lib/analytics';
import { KPICard } from '@/components/KPICard';
import { DollarSign, Users, TrendingUp, Percent } from 'lucide-react';

function Slider({ label, value, min, max, step, onChange, format }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-400">{label}</span>
        <span className="num text-white font-medium">{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brass-500" />
    </div>
  );
}

export default function ScenariosPage() {
  const { company, employees } = useStore();
  const [params, setParams] = useState({ revenue_growth_delta: 0, salary_increase: 0, new_hires: 0, operating_expense_change: 0 });

  const result = useMemo(
    () => (company ? runScenario(company, employees, params) : null),
    [company, employees, params]
  );

  if (!result) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Scenario simulator</h1>
        <p className="text-sm text-slate-500">Model a decision before you make it.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6 space-y-6 lg:col-span-1">
          <Slider label="Revenue growth" value={params.revenue_growth_delta} min={-30} max={50} step={1}
            format={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
            onChange={(v: number) => setParams((p) => ({ ...p, revenue_growth_delta: v }))} />
          <Slider label="Salary increase" value={params.salary_increase} min={0} max={30} step={1}
            format={(v: number) => `${v}%`}
            onChange={(v: number) => setParams((p) => ({ ...p, salary_increase: v }))} />
          <Slider label="New hires" value={params.new_hires} min={0} max={10} step={1}
            onChange={(v: number) => setParams((p) => ({ ...p, new_hires: v }))} />
          <Slider label="Operating expense change" value={params.operating_expense_change} min={-30} max={30} step={1}
            format={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
            onChange={(v: number) => setParams((p) => ({ ...p, operating_expense_change: v }))} />
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <KPICard label="Projected revenue" value={result.simulated.revenue.toLocaleString()} icon={DollarSign} accent="#4C8CFF"
              trend={{ direction: result.delta.revenue >= 0 ? 'up' : 'down', label: `${result.delta.revenue >= 0 ? '+' : ''}${result.delta.revenue.toLocaleString()}` }} />
            <KPICard label="Projected net profit" value={result.simulated.net_profit.toLocaleString()} icon={TrendingUp} accent="#3DDC97"
              trend={{ direction: result.delta.net_profit >= 0 ? 'up' : 'down', label: `${result.delta.net_profit >= 0 ? '+' : ''}${result.delta.net_profit.toLocaleString()}` }} />
            <KPICard label="Team size" value={`${result.simulated.employee_count}`} icon={Users} accent="#8B5CF6" />
            <KPICard label="Payroll ratio" value={`${result.simulated.payroll_ratio}%`} icon={Percent} accent="#E8A33D" />
          </div>
          <div className="card p-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">Resulting health score</p>
            <div className="flex items-center gap-3">
              <span className="num text-3xl font-semibold text-white">{result.simulated.health_score}</span>
              <span className="text-slate-500">/ 100 · {result.simulated.health_label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
