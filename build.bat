@echo off
REM ═══════════════════════════════════════
REM  SYNORA — Startup Script (Windows)
REM  Runs everything in ONE terminal
REM ═══════════════════════════════════════

echo.
echo  ======================================
echo        SYNORA — STARTING
echo  ======================================
echo.

REM ─── Backend Setup ───
echo [1/4] Installing backend dependencies...
cd /d "%~dp0"
if not exist "venv" (
    echo   Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r backend\requirements.txt --quiet

echo [2/4] Running migrations...
cd backend
python manage.py makemigrations --no-input
python manage.py migrate --no-input
echo   Backend ready!

REM ─── Frontend Setup ───
echo [3/4] Installing frontend dependencies...
cd ..\frontend
call npm install --silent

REM ─── Start Both Servers (same terminal, no new windows) ───
echo [4/4] Starting servers...
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo  ======================================
echo     SYNORA IS RUNNING!
echo   Press Ctrl+C to stop both servers.
echo  ======================================
echo.

REM Start backend in background (no new window)
cd ..\backend
start /B python manage.py runserver 2>&1

REM Small delay to let backend boot
timeout /t 2 /nobreak >nul

REM Start frontend in foreground (keeps terminal alive)
cd ..\frontend
call npx vite --host
