#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting NyayNeti MVP (backend + frontend)..."

cd "$ROOT_DIR/backend"
if [ ! -d "venv" ]; then
  echo "Python venv not found. Creating..."
  python -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true

if [ -f "requirements.txt" ]; then
  echo "Installing backend dependencies..."
  pip install -r requirements.txt
fi

echo "Starting Flask backend on port 8000..."
python app.py &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting Vite dev server..."
npm run dev &
FRONTEND_PID=$!

trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" INT TERM

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Visit: http://localhost:5173"

wait

