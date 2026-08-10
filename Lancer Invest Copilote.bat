@echo off
rem ============================================================
rem  Invest Copilote - lanceur double-clic (Windows)
rem  Demarre l'API + l'interface, puis ouvre le navigateur.
rem  (fichier ASCII uniquement : pas d'accents ici)
rem ============================================================
cd /d "%~dp0"

rem Recupere automatiquement les dernieres corrections (silencieux, ignore si hors ligne)
git pull --ff-only >nul 2>&1

echo.
echo   Invest Copilote - demarrage...
echo   Deux fenetres serveur vont s'ouvrir : NE PAS LES FERMER
echo   (tu peux les reduire). Le navigateur s'ouvrira tout seul.
echo.

start "Invest Copilote - API (ne pas fermer)" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\start-api.ps1"
start "Invest Copilote - Interface (ne pas fermer)" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\start-web.ps1"

rem Attend que l'interface reponde sur le port 3000 (max ~120 s), puis ouvre le navigateur
set /a tries=0
:waitloop
set /a tries+=1
if %tries% gtr 120 goto openbrowser
powershell -NoProfile -Command "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',3000);$c.Close();exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 (
  timeout /t 1 /nobreak >nul
  goto waitloop
)

:openbrowser
start "" http://localhost:3000
echo   Navigateur ouvert sur http://localhost:3000
echo   (si la page indique une erreur, patiente 10 s puis actualise avec F5)
timeout /t 8 >nul
exit
