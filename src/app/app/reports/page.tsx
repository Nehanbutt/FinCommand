'use client';

import { useMemo } from 'react';
import { Printer, Download } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateKpis, calculateHealthScore, generateSmartInsights } from '@/lib/analytics';

export default function ReportsPage() {
  const { company, employees } = useStore();

  const data = useMemo(() => {
    if (!company) return null;
    return {
      kpis: calculateKpis(company, employees),
      health: calculateHealthScore(company, employees),
      insights: generateSmartInsights(company, employees),
    };
  }, [company, employees]);

  const exportCsv = () => {
    if (!data || !company) return;
    const rows = [
      ['Metric', 'Value'],
      ...Object.entries(data.kpis).map(([k, v]) => [k, String(v)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name.replace(/\s+/g, '_')}_kpis.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!company || !data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Reports</h1>
          <p className="text-sm text-slate-500">A print-ready summary of your financial position.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportCsv} className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2"><Download size={15} /> Export CSV</button>
          <button onClick={() => window.print()} className="btn-primary text-sm py-2.5 px-4 flex items-center gap-2"><Printer size={15} /> Print / Save PDF</button>
        </div>
      </div>

      <div className="card p-8 space-y-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">{company.name}</h2>
          <p className="text-sm text-slate-500">{company.industry} · Financial Summary · {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(data.kpis).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{k.replace(/_/g, ' ')}</p>
              <p className="num text-lg font-semibold text-white">{typeof v === 'number' ? v.toLocaleString() : v}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">Health score: {data.health.score}/100 — {data.health.label}</p>
          <ul className="space-y-1.5">
            {data.health.reasons.map((r, i) => <li key={i} className="text-sm text-slate-400">· {r}</li>)}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">Key insights</p>
          <ul className="space-y-1.5">
            {data.insights.map((ins, i) => <li key={i} className="text-sm text-slate-400"><span className="text-white font-medium">{ins.title}:</span> {ins.message}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
