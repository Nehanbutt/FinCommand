#!/usr/bin/env bash
# FinCommand — Financial Command Center
# Starts both the backend API and the frontend dev server, checking dependencies first

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          FinCommand — Financial Command Center        ║"
echo "║           Executive Intelligence Platform             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

ROOT="$(dirname "$0")"

# ── Dependency Checks ────────────────────────────────────────────────────────

echo "▶ Checking backend dependencies..."
if ! python -c "import fastapi, uvicorn, sqlalchemy, pydantic, pandas, sklearn, reportlab, aiosqlite" &> /dev/null; then
    echo "  Installing backend dependencies (this may take a moment)..."
    cd "$ROOT/backend"
    pip install -r requirements.txt
    cd "$ROOT"
else
    echo "  ✓ Backend dependencies already installed"
fi

echo ""
echo "▶ Checking frontend dependencies..."
if [ ! -d "$ROOT/frontend/node_modules" ]; then
    echo "  Installing frontend dependencies (this may take a moment)..."
    cd "$ROOT/frontend"
    npm install
    cd "$ROOT"
else
    echo "  ✓ Frontend dependencies already installed"
fi

echo ""
# ── Backend ──────────────────────────────────────────────────────────────────
echo "▶ Starting backend API..."
cd "$ROOT/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  ✓ API running at http://localhost:8000"
echo "  ✓ API docs at   http://localhost:8000/docs"

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "▶ Starting frontend..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "  ✓ App running at http://localhost:5173"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Open http://localhost:5173 in your browser"
echo "  Press Ctrl+C to stop all services"
echo "═══════════════════════════════════════════════════════"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Stopped.'; exit 0" INT
wait
