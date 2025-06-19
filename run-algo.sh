#!/bin/bash

echo "🚀 Starting Algo-Trader..."

# Activate venv
source algo-env/bin/activate

# Start backend in background + log
echo "🔁 Starting FastAPI backend..."
uvicorn backend.main:app --reload > backend.log 2>&1 &
BACK_PID=$!

# Start React app
echo "⚛️ Starting React frontend..."
cd dashboard
npm start

# Kill backend if React is closed
kill $BACK_PID

