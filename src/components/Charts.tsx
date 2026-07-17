'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useStore } from '@/store/useStore';

function useChartTheme() {
  const { theme } = useStore();
  const dark = theme !== 'light';
  return {
    dark,
    grid: dark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.08)',
    tick: dark ? '#8B93A7' : '#5B6478',
    tickStrong: dark ? '#E5E9F0' : '#334155',
    tooltip: {
      background: dark ? '#0B0E17' : '#FFFFFF',
      border: dark ? '1px solid rgba(148,163,184,0.16)' : '1px solid rgba(15,23,42,0.1)',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      color: dark ? '#F2F4F8' : '#0F172A',
      boxShadow: dark ? 'none' : '0 8px 24px rgba(15,23,42,0.12)',
    },
    labelColor: dark ? '#F2F4F8' : '#0F172A',
  };
}

export function TrendChart({ data }: { data: any[] }) {
  const t = useChartTheme();
  return (
    <div className="card p-6 fade-in">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">Revenue vs. Expenses — 12 Month Trend</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: t.tick, fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={t.tooltip} labelStyle={{ color: t.labelColor }} />
          <Line type="monotone" dataKey="revenue" stroke="#4C8CFF" strokeWidth={2} dot={false} name="Revenue" />
          <Line type="monotone" dataKey="net_profit" stroke="#3DDC97" strokeWidth={2} dot={false} name="Net Profit" />
          <Line type="monotone" dataKey="payroll" stroke="#7C9BFF" strokeWidth={2} dot={false} name="Payroll" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentChart({ data }: { data: { name: string; monthly_payroll: number }[] }) {
  const t = useChartTheme();
  const colors = ['#4C8CFF', '#7C9BFF', '#3DDC97', '#8B5CF6', '#E8555A', '#06B6D4'];
  return (
    <div className="card p-6 fade-in">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">Payroll by Department</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
          <XAxis type="number" tick={{ fill: t.tick, fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: t.tickStrong, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
          <Tooltip contentStyle={t.tooltip} labelStyle={{ color: t.labelColor }} />
          <Bar dataKey="monthly_payroll" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastChart({ data }: { data: any[] }) {
  const t = useChartTheme();
  return (
    <div className="card p-6 fade-in">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">Forecast</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: t.tick, fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={t.tooltip} labelStyle={{ color: t.labelColor }} />
          <Line type="monotone" dataKey="revenue" stroke="#4C8CFF" strokeWidth={2} dot={false} name="Revenue" />
          <Line type="monotone" dataKey="net_profit" stroke="#3DDC97" strokeWidth={2} dot={false} name="Net Profit" />
          <Line type="monotone" dataKey="cash_balance" stroke="#7C9BFF" strokeWidth={2} dot={false} name="Cash Balance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
