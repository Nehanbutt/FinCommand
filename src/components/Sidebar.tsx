'use client';

import {
  LayoutDashboard, Users, Brain, FlaskConical, FileText,
  Zap, X, ChevronRight, UserPlus,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'intelligence', label: 'Intelligence', icon: Brain },
  { key: 'scenarios', label: 'Scenarios', icon: FlaskConical },
  { key: 'reports', label: 'Reports', icon: FileText },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname?.split('/')[2] || 'dashboard';
  const { company, employees } = useStore();

  const go = (path: string) => {
    router.push(path);
    onClose?.();
  };

  return (
    <>
      {/* Backdrop — mobile only, closes the drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-white/5 bg-[color:var(--bg-primary)] flex flex-col h-screen px-4 py-6 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2 mb-8">
          <button
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            onClick={() => window.location.reload()}
            aria-label="Refresh FinCommand"
            title="Refresh page"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-brass-400 to-brass-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-white">FinCommand</span>
          </button>
          <button className="text-slate-500 hover:text-white lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className={`sidebar-item ${active === key ? 'active' : ''}`}
              onClick={() => go(`/app/${key}`)}
            >
              <Icon size={17} />
              {label}
            </div>
          ))}
        </nav>

        {employees.length === 0 && (
          <button
            onClick={() => go('/app/employees')}
            className="mt-2 shrink-0 flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-left transition-colors hover:bg-amber-400/[0.1]"
          >
            <UserPlus size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-amber-300">No employees yet</span>
              <span className="block text-[11px] text-amber-200/60 leading-snug">Add your team for accurate scoring</span>
            </span>
          </button>
        )}

        {company && (
          <div
            className="mt-4 shrink-0 flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.04]"
            onClick={() => go('/app/settings')}
            role="button"
            aria-label="Company settings"
          >
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-br from-brass-400 to-brass-600">
              {initials(company.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{company.name}</p>
              <p className="text-xs text-slate-500 truncate">{company.industry || 'Manage profile'}</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0" />
          </div>
        )}
      </aside>
    </>
  );
}
