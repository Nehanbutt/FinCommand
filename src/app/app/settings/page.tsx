'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sun, Moon, Download, Upload, TriangleAlert, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SettingsPage() {
  const router = useRouter();
  const { company, updateCompany, theme, setTheme, exportData, importData, resetAll } = useStore();
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!company) return null;

  const update = (field: string, value: any) => updateCompany({ [field]: value });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const downloadBackup = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name.replace(/\s+/g, '_') || 'fincommand'}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetNow = () => {
    resetAll();
    router.push('/');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = importData(text);
    setImportMsg(ok
      ? { ok: true, text: 'Backup restored — your dashboard now reflects the imported data.' }
      : { ok: false, text: "That file doesn't look like a valid FinCommand backup." });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-500">Update your company profile — every score recalculates instantly.</p>
      </div>

      <section className="card p-6 space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Appearance</p>
          <p className="text-xs text-slate-500 mt-0.5">Choose how the dashboard looks. Dark is the default.</p>
        </div>
        <div className="theme-switch w-fit">
          <button
            type="button"
            className={theme === 'dark' ? 'active' : ''}
            onClick={() => setTheme('dark')}
          >
            <Moon size={14} /> Dark
          </button>
          <button
            type="button"
            className={theme === 'light' ? 'active' : ''}
            onClick={() => setTheme('light')}
          >
            <Sun size={14} /> Light
          </button>
        </div>
      </section>

      <form onSubmit={save} className="card p-6 space-y-4">
        <p className="text-sm font-semibold text-white -mb-1">Company profile</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Company name"><input className="input-field" value={company.name} onChange={(e) => update('name', e.target.value)} /></F>
          <F label="Industry"><input className="input-field" value={company.industry} onChange={(e) => update('industry', e.target.value)} /></F>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Monthly revenue"><input type="number" className="input-field" value={company.monthlyRevenue} onChange={(e) => update('monthlyRevenue', Number(e.target.value))} /></F>
          <F label="Cash balance"><input type="number" className="input-field" value={company.cashBalance} onChange={(e) => update('cashBalance', Number(e.target.value))} /></F>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Monthly operating expenses"><input type="number" className="input-field" value={company.monthlyOperatingExpenses} onChange={(e) => update('monthlyOperatingExpenses', Number(e.target.value))} /></F>
          <F label="Expected annual growth (%)"><input type="number" step="0.1" className="input-field keep-spinner" value={company.expectedRevenueGrowth} onChange={(e) => update('expectedRevenueGrowth', Number(e.target.value))} /></F>
        </div>

        <button type="submit" className="btn-primary py-2.5 px-5 flex items-center gap-2">
          {saved && <Check size={14} />}
          {saved ? 'Saved' : 'Save changes'}
        </button>
        <p className="text-xs text-slate-600">Changes save instantly to this browser as you type — the button above is just a confirmation.</p>
      </form>

      <section className="card p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-white">Backup &amp; restore</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Everything lives only in this browser. Export a JSON backup before clearing your cache, switching devices, or resetting — then import it here to pick up right where you left off.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadBackup} className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2">
            <Download size={15} /> Export backup (.json)
          </button>
          <label className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2 cursor-pointer">
            <Upload size={15} /> Import backup
            <input ref={fileRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
          </label>
        </div>
        {importMsg && (
          <p className={`text-xs flex items-center gap-1.5 ${importMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {!importMsg.ok && <TriangleAlert size={13} />}
            {importMsg.text}
          </p>
        )}
      </section>

      <section className="card p-6 space-y-4 border-red-500/20">
        <div>
          <p className="text-sm font-semibold text-white">Danger zone</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanently clears your company profile and every employee saved in this browser. Export a backup above first if you might need it again.
          </p>
        </div>

        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="btn-danger-outline text-sm py-2.5 px-4 flex items-center gap-2"
          >
            <RotateCcw size={15} /> Reset all data
          </button>
        ) : (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.06] p-4 space-y-3">
            <p className="text-sm text-red-300 flex items-center gap-2">
              <TriangleAlert size={15} /> This can't be undone. Reset everything?
            </p>
            <div className="flex gap-3">
              <button onClick={resetNow} className="btn-danger-outline text-sm py-2 px-4">
                Yes, reset everything
              </button>
              <button onClick={() => setConfirmingReset(false)} className="btn-secondary text-sm py-2 px-4">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
