#!/bin/bash

# ═══════════════════════════════════════
#  SYNORA — Startup Script (Git Bash)
# ═══════════════════════════════════════

echo "╔══════════════════════════════════╗"
echo "║        SYNORA — STARTING         ║"
echo "╚══════════════════════════════════╝"
echo ""

# ─── Backend Setup ───
echo "[1/4] Installing backend dependencies..."
cd "$(dirname "$0")"
if [ ! -d "venv" ]; then
    echo "  → Creating virtual environment..."
    python -m venv venv
fi
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate 2>/dev/null
pip install -r backend/requirements.txt --quiet

echo "[2/4] Running migrations..."
cd backend
python manage.py makemigrations --no-input
python manage.py migrate --no-input
echo "  ✓ Backend ready"

# ─── Frontend Setup ───
echo "[3/4] Installing frontend dependencies..."
cd ../frontend
npm install --silent

# ─── Start Both Servers ───
echo "[4/4] Starting servers..."
echo ""
echo "  → Backend:  http://localhost:8000"
echo "  → Frontend: http://localhost:5173"
echo ""

# Start backend in background
cd ../backend
python manage.py runserver &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════╗"
echo "║     SYNORA IS RUNNING! 🚀       ║"
echo "║  Press Ctrl+C to stop both      ║"
echo "╚══════════════════════════════════╝"

# Trap Ctrl+C to kill both processes
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for both
wait
