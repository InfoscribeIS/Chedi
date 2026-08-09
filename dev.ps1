# Démarre l'API (port 8000) et le frontend (port 3000) dans deux fenêtres PowerShell.
# Usage (depuis la racine du projet) :  .\dev.ps1   — puis ouvre http://localhost:3000
# Si les scripts sont bloqués : Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

$root = $PSScriptRoot

Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\apps\api'; " +
  "if (!(Test-Path .venv)) { Write-Host '→ Installation backend…'; py -3 -m venv .venv; .venv\Scripts\pip install -r requirements.txt }; " +
  ".venv\Scripts\python -m uvicorn app.main:app --reload"
)

Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\apps\web'; " +
  "if (!(Test-Path node_modules)) { Write-Host '→ Installation frontend…'; npm install }; " +
  "npm run dev"
)

Write-Host ""
Write-Host "✅ Deux fenêtres se lancent (backend + frontend)."
Write-Host "   Quand elles affichent 'Uvicorn running' et 'Ready', ouvre : http://localhost:3000"
