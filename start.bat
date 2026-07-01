@echo off
setlocal

echo.
echo ========================================================
echo           FinCommand -- Financial Command Center        
echo            Executive Intelligence Platform             
echo ========================================================
echo.

set "ROOT=%~dp0"

echo [1/4] Checking backend dependencies...
python -c "import fastapi, uvicorn, sqlalchemy, pydantic, pandas, sklearn, reportlab, aiosqlite" >nul 2>nul
if %errorlevel% neq 0 (
    echo   Installing backend dependencies ^(this may take a moment^)...
    cd /d "%ROOT%backend"
    pip install -r requirements.txt
    cd /d "%ROOT%"
) else (
    echo   - Backend dependencies already installed
)

echo.
echo [2/4] Checking frontend dependencies...
if not exist "%ROOT%frontend\node_modules\" (
    echo   Installing frontend dependencies ^(this may take a moment^)...
    cd /d "%ROOT%frontend"
    call npm install
    cd /d "%ROOT%"
) else (
    echo   - Frontend dependencies already installed
)

echo.
echo [3/4] Starting backend API...
cd /d "%ROOT%backend"
start "FinCommand API" /b python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo   - API running at http://localhost:8000

echo.
echo [4/4] Starting frontend...
cd /d "%ROOT%frontend"
start "FinCommand Frontend" /b call npm run dev
echo   - App running at http://localhost:5173

echo.
echo ========================================================
echo   Open http://localhost:5173 in your browser
echo   Press any key to stop all services
echo ========================================================
echo.

pause >nul
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im python.exe >nul 2>nul
echo Stopped.
