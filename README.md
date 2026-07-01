# FinCommand — Financial Command Center

> **Executive Intelligence Platform for Small & Medium Businesses**
>
> *Minimal Inputs. Maximum Insights.*

---

## What Is This?

FinCommand is a premium financial intelligence platform that transforms a small amount of company data into over **100 actionable business insights**. It's built for SME founders, CFOs, and operators who want clarity without complexity.

**You enter ~15 values. The platform generates:**
- Company Health Score with breakdown and explanation
- Smart Insights (dynamic, never hardcoded)
- Financial KPIs across revenue, payroll, expenses, and cash
- Employee Intelligence with transparent performance scoring
- 12-Month Financial Forecasting
- What-If Scenario Simulator
- Automated Recommendations
- Downloadable Reports

---

## Quick Start

### Start the application

The startup scripts will automatically check for and install any missing dependencies for both the frontend and backend.

**For Windows:**
Double-click `start.bat` in your File Explorer, or run it via terminal:
```cmd
.\start.bat
```

**For Mac / Linux / Git Bash:**
```bash
bash start.sh
```

### Open in your browser
```
http://localhost:5173
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy, SQLite |
| Auth | JWT + bcrypt password hashing |
| Analytics | Pandas, NumPy, Scikit-Learn |
| Frontend | React 18, TypeScript, Vite |
| Styling | TailwindCSS |
| Charts | Recharts |
| State | Zustand |

---

## Features

### 🏠 Dashboard
- 15+ KPI cards with real-time data
- Animated area/bar/line charts
- Revenue vs Expense trend
- Department cost breakdown
- Salary distribution

### 💯 Company Health Score
Intelligent 0–100 score based on:
- Profitability (25 pts)
- Liquidity / Cash Runway (20 pts)
- Payroll Ratio (20 pts)
- Revenue Growth (20 pts)
- Expense Control (15 pts)

### 🔍 Smart Insights
Dynamically generated observations — never hardcoded. Examples:
- *"Payroll consumes 42% of monthly revenue — above the 50% threshold"*
- *"Cash reserves can sustain operations for 11 months"*
- *"Revenue per employee is below the 3x cost benchmark"*

### 👥 Employee Intelligence
Every employee receives:
- Productivity Score
- Cost Efficiency Score
- Growth Score
- Reliability Score
- Overall Score + Classification + Explanation

### 📈 Financial Forecasting
12-month projections using compound growth modeling:
- Revenue, Payroll, OpEx, Profit, Cash Balance
- Confidence bands that decay with forecast horizon
- Tabular + chart views

### 🧪 Scenario Simulator
Adjust and instantly simulate:
- Revenue growth change
- Salary increases
- New headcount
- Operating expense shifts

See live impact on all KPIs, health score, and profit.

### 📄 Reports
Download formatted reports:
- Executive Summary
- Financial Report
- Payroll Report
- Employee Performance
- Forecast Report

---

## CSV Import

Import employees from `sample_employees.csv` (included):

**Required columns:** `name, department, position, salary, joining_date`

**Optional columns:** `working_hours, employment_status`

**Supported date formats:** `YYYY-MM-DD`, `MM/DD/YYYY`, `DD/MM/YYYY`

---

## Architecture

```
financial-command-center/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models/database.py   # SQLAlchemy models + SQLite
│   ├── schemas/schemas.py   # Pydantic request/response schemas
│   ├── services/
│   │   ├── analytics.py     # Core business intelligence engine
│   │   ├── forecasting.py   # Financial forecasting models
│   │   └── auth_service.py  # JWT + password hashing
│   └── routers/             # API route handlers
├── frontend/
│   └── src/
│       ├── components/      # Reusable UI + chart components
│       ├── pages/           # Full page views
│       ├── services/api.ts  # Axios API client
│       ├── store/           # Zustand global state
│       └── utils/format.ts  # Currency/number formatters
├── sample_employees.csv
├── install.sh
└── start.sh
```

---

## API Documentation

With the backend running, visit:
```
http://localhost:8000/docs
```
Interactive Swagger UI with all endpoints documented.

---

## Security

- Passwords hashed with bcrypt
- JWT tokens with 7-day expiry
- All data stored locally in `backend/financial_command.db`
- No external services, no telemetry, no cloud

---

*Built as a portfolio-quality SaaS demonstration.*
