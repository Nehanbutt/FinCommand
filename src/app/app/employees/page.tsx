'use client';

import { useMemo, useRef, useState } from 'react';
import { Plus, Upload, Trash2, Search, Pencil, ChevronDown, Sparkles, Loader2, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Employee, EmploymentStatus, RoleArchetype } from '@/lib/types';
import { suggestArchetype, ARCHETYPE_WEIGHTS } from '@/lib/performanceEngine';
import { buildSampleEmployees } from '@/lib/sampleData';

const EMPTY_FORM = {
  name: '', department: '', position: '', salary: '', joining_date: '',
  working_hours: '40', employment_status: 'full_time' as EmploymentStatus,
  role_archetype: '' as RoleArchetype | '',
  output_label: '', actual_output: '', expected_output: '', output_unit_value: '', error_count: '',
};
type FormState = typeof EMPTY_FORM;

const ARCHETYPE_OPTIONS: { value: RoleArchetype; label: string; hint: string }[] = [
  { value: 'volume', label: ARCHETYPE_WEIGHTS.volume.label, hint: ARCHETYPE_WEIGHTS.volume.outputHint },
  { value: 'transaction', label: ARCHETYPE_WEIGHTS.transaction.label, hint: ARCHETYPE_WEIGHTS.transaction.outputHint },
  { value: 'service', label: ARCHETYPE_WEIGHTS.service.label, hint: ARCHETYPE_WEIGHTS.service.outputHint },
  { value: 'support', label: ARCHETYPE_WEIGHTS.support.label, hint: ARCHETYPE_WEIGHTS.support.outputHint },
];

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else cur += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cells.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  };
  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

function parseDate(value: string): Date | null {
  let m = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return null;
}

function employeeToForm(e: Employee): FormState {
  return {
    name: e.name,
    department: e.department,
    position: e.position,
    salary: String(e.salary),
    joining_date: e.joiningDate.slice(0, 10),
    working_hours: String(e.workingHours),
    employment_status: e.employmentStatus,
    role_archetype: e.roleArchetype ?? '',
    output_label: e.outputLabel ?? '',
    actual_output: e.actualOutput != null ? String(e.actualOutput) : '',
    expected_output: e.expectedOutput != null ? String(e.expectedOutput) : '',
    output_unit_value: e.outputUnitValue != null ? String(e.outputUnitValue) : '',
    error_count: e.errorCount != null ? String(e.errorCount) : '',
  };
}

function formToEmployeeInput(form: FormState): Omit<Employee, 'id' | 'isActive'> {
  return {
    name: form.name,
    department: form.department,
    position: form.position,
    salary: Number(form.salary),
    joiningDate: new Date(form.joining_date).toISOString(),
    workingHours: Number(form.working_hours) || 40,
    employmentStatus: form.employment_status,
    roleArchetype: (form.role_archetype || suggestArchetype(form.position)) as RoleArchetype,
    outputLabel: form.output_label || undefined,
    actualOutput: form.actual_output !== '' ? Number(form.actual_output) : undefined,
    expectedOutput: form.expected_output !== '' ? Number(form.expected_output) : undefined,
    outputUnitValue: form.output_unit_value !== '' ? Number(form.output_unit_value) : undefined,
    errorCount: form.error_count !== '' ? Number(form.error_count) : undefined,
  };
}

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, importEmployeesCsv, loadSampleEmployees } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPerf, setShowPerf] = useState(true);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loadingSample, setLoadingSample] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLoadSample = () => {
    if (loadingSample) return;
    setLoadingSample(true);
    // Brief, deliberate loading beat (not a fake stall) so the action reads
    // as "building your roster" rather than an instant, jarring pop-in.
    window.setTimeout(() => {
      const added = loadSampleEmployees(buildSampleEmployees());
      setImportMsg(
        added > 0
          ? `Loaded ${added} sample employees — spanning every role type, so Employee Intelligence has something real to show.`
          : 'Sample roster is already loaded.'
      );
      setLoadingSample(false);
    }, 450);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.name, e.department, e.position].some((f) => f.toLowerCase().includes(q))
    );
  }, [employees, query]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (e: Employee) => {
    setEditingId(e.id);
    setForm(employeeToForm(e));
    setShowForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = formToEmployeeInput(form);
    if (editingId != null) updateEmployee(editingId, input);
    else addEmployee(input);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    const required = ['name', 'department', 'position', 'salary', 'joining_date'];
    const errors: string[] = [];
    const toInsert: Omit<Employee, 'id' | 'isActive'>[] = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      if (!required.every((f) => Object.keys(row).includes(f))) {
        errors.push(`Row ${rowNum}: missing required columns`);
        return;
      }
      const salary = parseFloat(row.salary);
      const joiningDate = parseDate(row.joining_date);
      if (!(salary > 0) || !joiningDate) {
        errors.push(`Row ${rowNum}: invalid salary or date`);
        return;
      }
      const position = row.position;
      toInsert.push({
        name: row.name,
        department: row.department,
        position,
        salary,
        joiningDate: joiningDate.toISOString(),
        workingHours: row.working_hours ? parseFloat(row.working_hours) : 40,
        employmentStatus: (row.employment_status || 'full_time').toLowerCase().replace(/\s+/g, '_') as EmploymentStatus,
        roleArchetype: (row.role_archetype as RoleArchetype) || suggestArchetype(position),
        outputLabel: row.output_label || undefined,
        actualOutput: row.actual_output ? parseFloat(row.actual_output) : undefined,
        expectedOutput: row.expected_output ? parseFloat(row.expected_output) : undefined,
        outputUnitValue: row.output_unit_value ? parseFloat(row.output_unit_value) : undefined,
        errorCount: row.error_count ? parseFloat(row.error_count) : undefined,
      });
    });

    if (toInsert.length) importEmployeesCsv(toInsert);
    setImportMsg(`Imported ${toInsert.length} of ${rows.length} rows${errors.length ? ` — ${errors.length} skipped` : ''}.`);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Employees</h1>
          <p className="text-sm text-slate-500">
            {query ? `${filtered.length} of ${employees.length} match` : `${employees.length} on the roster`}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, department, position…"
              className="input-field !w-64 pl-9"
            />
          </div>
          <label className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2 cursor-pointer">
            <Upload size={15} /> Import CSV
            <input ref={fileRef} type="file" accept=".csv" onChange={onFile} className="hidden" />
          </label>
          <button
            onClick={handleLoadSample}
            disabled={loadingSample}
            className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2 disabled:opacity-70"
          >
            {loadingSample ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {loadingSample ? 'Loading…' : 'Load sample data'}
          </button>
          <button onClick={showForm ? () => setShowForm(false) : openAddForm} className="btn-primary text-sm py-2.5 px-4 flex items-center gap-2">
            <Plus size={15} /> Add employee
          </button>
        </div>
      </div>

      {importMsg && <p className="text-sm text-slate-400">{importMsg}</p>}

      {employees.length === 0 && !showForm && (
        <div className="card p-8 flex flex-col items-center text-center gap-3 border-dashed">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brass-400/20 to-brass-600/20">
            <Users size={22} className="text-brass-400" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">No employees on the roster yet</p>
            <p className="text-sm text-slate-500 max-w-md">
              Add your team manually, import a CSV, or load a ready-made sample roster to see Employee Intelligence
              in action right away — ten employees across every role type and data scenario.
            </p>
          </div>
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleLoadSample}
              disabled={loadingSample}
              className="btn-primary text-sm py-2.5 px-4 flex items-center gap-2 disabled:opacity-70"
            >
              {loadingSample ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {loadingSample ? 'Loading…' : 'Load sample data'}
            </button>
            <button onClick={openAddForm} className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2">
              <Plus size={15} /> Add employee
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="card p-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">{editingId != null ? 'Edit employee' : 'Basics'}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <input required placeholder="Name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required placeholder="Department" className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <input required placeholder="Position" className="input-field" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              <input required type="number" min="0" placeholder="Annual salary" className="input-field" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              <input required type="date" className="input-field" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
              <input required type="number" min="1" placeholder="Weekly hours" className="input-field" value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} />
              <select className="input-field" value={form.employment_status} onChange={(e) => setForm({ ...form, employment_status: e.target.value as EmploymentStatus })}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowPerf((v) => !v)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors mt-4 mb-3"
            >
              <ChevronDown size={13} className={`transition-transform ${showPerf ? 'rotate-180' : ''}`} />
              Performance data (optional — powers Employee Intelligence)
            </button>
            {showPerf && (
              <>
                <p className="text-xs text-slate-600 mb-3 max-w-2xl">
                  Leave any of this blank and the score still works — it just falls back to a peer benchmark and gets flagged with lower confidence.
                  Enter this period's numbers here each cycle to keep scores current.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <select className="input-field" value={form.role_archetype} onChange={(e) => setForm({ ...form, role_archetype: e.target.value as RoleArchetype })}>
                    <option value="">Role archetype — auto-detect from position</option>
                    {ARCHETYPE_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                  <input placeholder="Output label (e.g. deals closed)" className="input-field" value={form.output_label} onChange={(e) => setForm({ ...form, output_label: e.target.value })} />
                  <input type="number" min="0" placeholder="Actual output this period" className="input-field" value={form.actual_output} onChange={(e) => setForm({ ...form, actual_output: e.target.value })} />
                  <input type="number" min="0" placeholder="Expected output (blank = peer avg)" className="input-field" value={form.expected_output} onChange={(e) => setForm({ ...form, expected_output: e.target.value })} />
                  <input type="number" min="0" placeholder="$ value per unit of output" className="input-field" value={form.output_unit_value} onChange={(e) => setForm({ ...form, output_unit_value: e.target.value })} />
                  <input type="number" min="0" placeholder="Errors / rework this period" className="input-field" value={form.error_count} onChange={(e) => setForm({ ...form, error_count: e.target.value })} />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary py-2.5 px-5">{editingId != null ? 'Save changes' : 'Save employee'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary py-2.5 px-5">Cancel</button>
          </div>
        </form>
      )}

      {employees.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-white/5">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Position</th>
                <th className="px-6 py-3 font-medium">Salary</th>
                <th className="px-6 py-3 font-medium">This period</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No employees match "{query}".</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3.5 text-white font-medium">{e.name}</td>
                  <td className="px-6 py-3.5 text-slate-400">{e.department}</td>
                  <td className="px-6 py-3.5 text-slate-400">{e.position}</td>
                  <td className="px-6 py-3.5 num text-slate-300">{e.salary.toLocaleString()}</td>
                  <td className="px-6 py-3.5 num text-slate-400">
                    {e.actualOutput != null ? `${e.actualOutput} ${e.outputLabel || 'units'}` : <span className="text-slate-600">— not set</span>}
                  </td>
                  <td className="px-6 py-3.5"><span className="badge" style={{ background: '#4C8CFF1f', color: '#4C8CFF' }}>{e.employmentStatus.replace('_', ' ')}</span></td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <button onClick={() => openEditForm(e)} className="text-slate-500 hover:text-slate-200 transition-colors mr-3" aria-label="Edit employee">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteEmployee(e.id)} className="text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete employee">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
