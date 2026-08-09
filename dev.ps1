# Lance backend + frontend dans deux fenetres PowerShell, puis ouvre http://localhost:3000
# Fichier ASCII uniquement (compat PowerShell 5.1 quel que soit l encodage).
$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\scripts\start-api.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\scripts\start-web.ps1"

Write-Host ""
Write-Host "Deux fenetres se lancent : backend (port 8000) et frontend (port 3000)."
Write-Host "Quand elles affichent 'Uvicorn running' et 'Ready', ouvre : http://localhost:3000"
