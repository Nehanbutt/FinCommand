'use client';

import { LucideIcon } from 'lucide-react';

export function KPICard({
  label, value, sub, icon: Icon, accent = '#4C8CFF', trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  accent?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
}) {
  return (
    <div className="card card-hover p-5 fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${accent}18` }}>
            <Icon size={15} style={{ color: accent }} />
          </div>
        )}
      </div>
      <p className="num text-2xl font-semibold text-white mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
      {trend && (
        <p className="num text-xs mt-1" style={{ color: trend.direction === 'up' ? '#3DDC97' : trend.direction === 'down' ? '#E8555A' : '#8B93A7' }}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
        </p>
      )}
    </div>
  );
}
