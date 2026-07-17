'use client';

export function HealthScore({ health }: { health: { score: number; label: string; color: string; reasons: string[]; breakdown: Record<string, number> } }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, health.score)) / 100;
  const offset = circumference * (1 - pct);

  return (
    <div className="card p-6 fade-in">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">Company Health Score</p>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="12" />
            <circle
              cx="80" cy="80" r={radius} fill="none" stroke={health.color} strokeWidth="12"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-4xl font-semibold text-white">{health.score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="badge mb-3" style={{ background: `${health.color}1f`, color: health.color }}>{health.label}</span>
          <ul className="space-y-2">
            {health.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="text-sm text-slate-400 leading-snug">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
