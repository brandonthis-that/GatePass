#!/usr/bin/env bash
# Quick "click-and-play" runner for the GatePass prototype.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$ROOT/.venv"

echo "GatePass quick runner"
if [ ! -d "$VENV" ]; then
  echo "Creating virtualenv..."
  python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"

if [ ! -f "$VENV/requirements_installed" ]; then
  echo "Installing Python requirements (fast, minimal)..."
  pip install --upgrade pip >/dev/null
  pip install -r "$ROOT/requirements.txt"
  touch "$VENV/requirements_installed"
fi

echo "Starting app on http://127.0.0.1:5000 (Press Ctrl+C to stop)"
python "$ROOT/app.py"
