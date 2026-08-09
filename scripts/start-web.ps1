# Frontend Invest Copilote (port 3000). Fichier ASCII uniquement (compat PowerShell 5.1).
Set-Location (Join-Path $PSScriptRoot "..\apps\web")

if (!(Test-Path node_modules)) {
  Write-Host "Premiere installation du frontend (quelques minutes)..."
  npm install
}

Write-Host "Demarrage de l interface sur http://localhost:3000"
npm run dev
