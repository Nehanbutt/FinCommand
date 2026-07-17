'use client';

import { AlertTriangle, Info, CheckCircle2, TrendingUp, TrendingDown, PieChart, Users, Rocket, Target, UserPlus, Clock, ShieldCheck } from 'lucide-react';

const ICONS: Record<string, any> = {
  alert: AlertTriangle,
  info: Info,
  check: CheckCircle2,
  'alert-triangle': AlertTriangle,
  clock: Clock,
  shield: ShieldCheck,
  'pie-chart': PieChart,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  rocket: Rocket,
  target: Target,
  users: Users,
  'user-plus': UserPlus,
};

const COLORS: Record<string, string> = {
  danger: '#E8555A',
  warning: '#E8A33D',
  success: '#3DDC97',
  info: '#4C8CFF',
};

export function SmartInsights({ insights }: { insights: { type: string; icon: string; title: string; message: string }[] }) {
  return (
    <div className="card p-6 fade-in">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">Smart Insights</p>
      <div className="space-y-4">
        {insights.map((ins, i) => {
          const Icon = ICONS[ins.icon] || Info;
          const color = COLORS[ins.type] || '#4C8CFF';
          return (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{ins.title}</p>
                <p className="text-sm text-slate-400 leading-snug mt-0.5">{ins.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
