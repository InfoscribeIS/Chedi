#!/usr/bin/env bash
# Démarre l'API (port 8000) et le frontend (port 3000) en une commande.
# Usage : ./dev.sh   — puis ouvre http://localhost:3000
set -e
cd "$(dirname "$0")"

if [ ! -d apps/api/.venv ]; then
  echo "→ Première installation du backend (Python)…"
  (cd apps/api && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt)
fi
if [ ! -d apps/web/node_modules ]; then
  echo "→ Première installation du frontend (Node)…"
  (cd apps/web && npm install)
fi

trap 'kill 0' EXIT INT TERM
(cd apps/api && .venv/bin/python -m uvicorn app.main:app --reload) &
(cd apps/web && npm run dev) &
echo ""
echo "✅ Invest Copilote démarre : ouvre http://localhost:3000  (API : http://localhost:8000/docs)"
echo "   Ctrl+C pour tout arrêter."
wait
