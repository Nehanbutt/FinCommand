# FinCommand

Executive financial intelligence for SME founders — a company health score,
smart insights, employee scoring, 12-month forecasting, and a scenario
simulator, generated from ~15 numbers you enter once.

## No accounts, no server, no database

This version stores everything **in your browser** (`localStorage`) and
computes every score, insight, and forecast **client-side**. There is no
`/api` folder, no login, no signup, and nothing to connect on a hosting
dashboard. Open the app and it works immediately, on any static host.

This was a deliberate simplification after repeated trouble getting a
database wired correctly across local dev and a live deployment. Trade-off,
stated plainly: your data lives in one browser on one device — clearing
browser storage or opening the app on another device starts fresh. If you
outgrow that later (multiple users, cross-device sync), the path back is to
reintroduce API routes + a real database — `src/lib/analytics.ts` and
`src/lib/forecasting.ts` are pure functions with no storage code in them at
all, so that future change would only touch `src/store/useStore.ts` and the
pages that call it, not the business logic.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — fill in the company setup form, or import
`sample_employees.csv` from the Employees page to populate the dashboard
instantly.

For production:
```bash
npm run build
npm start
```

Every route builds as **static** (confirm with `npm run build` — you'll see
`○ (Static)` next to every page), so this deploys anywhere that serves
static files: Vercel, Netlify, GitHub Pages, or a plain static host.

## Project layout

```
src/
  app/
    page.tsx              landing page
    onboarding/            company setup — saves straight to the browser
    app/                   dashboard/employees/intelligence/forecast/
                            scenarios/reports/settings, all client-computed
  lib/
    types.ts               Company / Employee / Snapshot types
    analytics.ts            health score, KPIs, insights, employee scoring,
                            department breakdown, recommendations, scenarios
    forecasting.ts          12-month growth-rate forecast
  store/
    useStore.ts             the only "database" — zustand + localStorage
  components/                Sidebar, charts, KPI cards, landing page, etc.
```

## Design notes

The visual language leans into a "financial instrument panel" feel: a
near-black base, a brass/amber accent instead of the default purple-on-black
SaaS look, and every number on screen rendered in a monospace, tabular-figure
font — like a ledger or terminal readout.
