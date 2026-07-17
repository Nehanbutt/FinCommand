'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import OnboardingBackground from '@/components/OnboardingBackground';
import { buildSampleCompany } from '@/lib/sampleData';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'CAD', 'AUD'];

// Scoped to this page only — deliberately not reusing the shared
// .input-field / .btn-primary classes, so the rest of the app (dashboard,
// sidebar, etc.) keeps its existing brass/ink theme untouched.
const inputClass =
  'w-full rounded-lg border border-white/10 bg-[#0B0E17] px-3.5 py-2.5 text-sm text-[#F2F4F8] ' +
  'transition-colors placeholder:text-[#55607A] focus:border-[#7C9BFF] focus:outline-none ' +
  'focus:ring-[3px] focus:ring-[#7C9BFF]/15';

export default function OnboardingPage() {
  const router = useRouter();
  const { company, hasHydrated, setupCompany } = useStore();
  const [form, setForm] = useState({
    name: '', industry: '', country: '', currency: 'USD',
    monthly_revenue: '', cash_balance: '', monthly_operating_expenses: '', expected_revenue_growth: '5',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasHydrated && company) router.replace('/app/dashboard');
  }, [hasHydrated, company]);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  if (!hasHydrated || company) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 overflow-hidden" style={{ background: '#05070D' }}>
        <OnboardingBackground />
        <div className="relative z-10 w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3B5BFF] to-[#7C9BFF] animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border-2 border-[#7C9BFF]/40 border-t-transparent animate-spin" />
          <Zap size={22} className="relative text-white" />
        </div>
        <p className="relative z-10 text-sm text-slate-500 font-medium tracking-wide">Loading FinCommand…</p>
      </div>
    );
  }

  const fillSample = () => {
    const s = buildSampleCompany();
    setForm({
      name: s.name,
      industry: s.industry,
      country: s.country,
      currency: s.currency,
      monthly_revenue: String(s.monthlyRevenue),
      cash_balance: String(s.cashBalance),
      monthly_operating_expenses: String(s.monthlyOperatingExpenses),
      expected_revenue_growth: String(s.expectedRevenueGrowth),
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setupCompany({
      name: form.name,
      industry: form.industry,
      country: form.country,
      currency: form.currency,
      monthlyRevenue: Number(form.monthly_revenue),
      cashBalance: Number(form.cash_balance),
      monthlyOperatingExpenses: Number(form.monthly_operating_expenses),
      expectedRevenueGrowth: Number(form.expected_revenue_growth),
    });
    router.push('/app/dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-16" style={{ background: '#05070D' }}>
      <OnboardingBackground />
      <div className="relative z-10 w-full max-w-xl">
        <Link
          href="/"
          className="mb-6 flex w-fit items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#3B5BFF] to-[#7C9BFF]">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-white">FinCommand</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#12151F] p-8">
          <div className="flex items-start justify-between gap-4 mb-1.5">
            <h1 className="font-display text-2xl font-semibold text-white">Set up your company</h1>
            <button
              type="button"
              onClick={fillSample}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-[#7C9BFF]/50 hover:text-white"
            >
              <Sparkles size={13} /> Fill with sample data
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-7">
            Fifteen numbers, five minutes — this powers every score on your dashboard. Saved only in this browser, nothing leaves your device.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company name">
                <input required className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter company name" />
              </Field>
              <Field label="Industry">
                <input required className={inputClass} value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="Enter industry" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Country">
                <input required className={inputClass} value={form.country} onChange={(e) => update('country', e.target.value)} placeholder="Enter country" />
              </Field>
              <Field label="Currency">
                <select className={inputClass} value={form.currency} onChange={(e) => update('currency', e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Monthly revenue">
                <input required type="number" min="0" step="0.01" className={inputClass} value={form.monthly_revenue} onChange={(e) => update('monthly_revenue', e.target.value)} placeholder="Enter revenue" />
              </Field>
              <Field label="Cash balance">
                <input required type="number" min="0" step="0.01" className={inputClass} value={form.cash_balance} onChange={(e) => update('cash_balance', e.target.value)} placeholder="Enter cash balance" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Monthly operating expenses">
                <input required type="number" min="0" step="0.01" className={inputClass} value={form.monthly_operating_expenses} onChange={(e) => update('monthly_operating_expenses', e.target.value)} placeholder="Enter monthly expenses" />
              </Field>
              <Field label="Expected annual growth (%)">
                <input required type="number" step="0.1" className={`${inputClass} keep-spinner`} value={form.expected_revenue_growth} onChange={(e) => update('expected_revenue_growth', e.target.value)} placeholder="Enter expected growth" />
              </Field>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-80"
              style={{ background: 'linear-gradient(135deg, #3B5BFF, #7C9BFF)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Setting up your command center…
                </>
              ) : (
                <>
                  Enter command center <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
