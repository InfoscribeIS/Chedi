# Backend Invest Copilote (port 8000). Fichier ASCII uniquement (compat PowerShell 5.1).
Set-Location (Join-Path $PSScriptRoot "..\apps\api")

if (!(Test-Path .venv)) {
  Write-Host "Premiere installation du backend (2 a 5 minutes)..."
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { py -3 -m venv .venv } else { python -m venv .venv }
  .venv\Scripts\pip install -r requirements.txt
}

Write-Host "Demarrage de l API sur http://localhost:8000 (docs: /docs)"
# --reload-dir app : ne surveiller que le code, sinon chaque ecriture SQLite
# (investcopilot.db) declenche un redemarrage -> "API injoignable" d une seconde
.venv\Scripts\python -m uvicorn app.main:app --reload --reload-dir app
