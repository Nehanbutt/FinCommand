'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { company, hasHydrated } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated && !company) router.replace('/onboarding');
  }, [hasHydrated, company]);

  // Close the mobile drawer automatically whenever the route changes.
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  if (!hasHydrated) {
    return (
      <div className="app-scope min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brass-400 to-brass-600 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border-2 border-brass-300/40 border-t-transparent animate-spin" />
          <Zap size={22} className="relative text-white" />
        </div>
        <p className="text-sm text-slate-500 font-medium tracking-wide">Loading FinCommand…</p>
      </div>
    );
  }

  if (!company) return null; // redirecting to onboarding

  return (
    <div className="app-scope lg:flex min-h-screen">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Mobile-only top bar — the sidebar becomes an off-canvas drawer below the lg breakpoint */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 lg:hidden">
        <button
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={() => window.location.reload()}
          aria-label="Refresh FinCommand"
          title="Refresh page"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-brass-400 to-brass-600">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display font-semibold text-white">FinCommand</span>
        </button>
        <button
          className="text-slate-400 hover:text-white p-1.5"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
