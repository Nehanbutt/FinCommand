'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, Employee, EmploymentStatus, Snapshot } from '@/lib/types';

let nextId = 1;
const genId = () => nextId++;

export type Theme = 'dark' | 'light';

interface AppState {
  company: Company | null;
  employees: Employee[];
  snapshots: Snapshot[];
  hasHydrated: boolean;
  theme: Theme;

  setupCompany: (input: Omit<Company, 'id'>) => void;
  updateCompany: (patch: Partial<Company>) => void;

  addEmployee: (input: Omit<Employee, 'id' | 'isActive'>) => void;
  updateEmployee: (id: number, patch: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  importEmployeesCsv: (rows: Omit<Employee, 'id' | 'isActive'>[]) => void;
  loadSampleEmployees: (rows: Omit<Employee, 'id' | 'isActive'>[]) => number;

  resetAll: () => void;
  setHasHydrated: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  exportData: () => string;
  importData: (json: string) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      company: null,
      employees: [],
      snapshots: [],
      hasHydrated: false,
      theme: 'dark',

      setupCompany: (input) => set({ company: { ...input, id: genId() } }),
      updateCompany: (patch) => set((s) => (s.company ? { company: { ...s.company, ...patch } } : s)),

      addEmployee: (input) =>
        set((s) => ({ employees: [...s.employees, { ...input, id: genId(), isActive: true }] })),
      updateEmployee: (id, patch) =>
        set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
      importEmployeesCsv: (rows) =>
        set((s) => ({
          employees: [...s.employees, ...rows.map((r) => ({ ...r, id: genId(), isActive: true }))],
        })),
      loadSampleEmployees: (rows) => {
        const existing = new Set(get().employees.map((e) => `${e.name.toLowerCase()}|${e.department.toLowerCase()}`));
        const toAdd = rows.filter((r) => !existing.has(`${r.name.toLowerCase()}|${r.department.toLowerCase()}`));
        if (toAdd.length) {
          set((s) => ({ employees: [...s.employees, ...toAdd.map((r) => ({ ...r, id: genId(), isActive: true }))] }));
        }
        return toAdd.length;
      },

      resetAll: () => set({ company: null, employees: [], snapshots: [] }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      exportData: () => {
        const s = get();
        return JSON.stringify(
          { company: s.company, employees: s.employees, snapshots: s.snapshots, exportedAt: new Date().toISOString() },
          null,
          2
        );
      },
      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (!parsed || typeof parsed !== 'object' || !parsed.company) return false;
          set({
            company: parsed.company,
            employees: Array.isArray(parsed.employees) ? parsed.employees : [],
            snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'fincommand-data', // localStorage key
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

export type { EmploymentStatus };
