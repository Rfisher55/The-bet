#!/usr/bin/env bash
# Start The Bet — D1 Football Predictor
# Usage: ./serve.sh [port]
PORT=${1:-3000}
echo "Starting The Bet on http://localhost:$PORT"
echo "Press Ctrl+C to stop."
npx http-server src/static -p "$PORT" -c-1 --cors -o
