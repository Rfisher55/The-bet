#!/usr/bin/env bash
# Start The Bet — D1 Football Predictor
# Usage: ./serve.sh [port]
PORT=${1:-3000}

# Kill any existing server on that port
fuser -k "${PORT}/tcp" 2>/dev/null || true

echo "Starting The Bet on http://localhost:${PORT}"
echo "Press Ctrl+C to stop."
PORT="$PORT" node "$(dirname "$0")/server.js"
