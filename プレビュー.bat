@echo off
cd /d "%~dp0"
set PORT=8765
set NPX=C:\Program Files\nodejs\npx.cmd
if not exist "%NPX%" (
  echo Node.js not found.
  pause
  exit /b 1
)
start /b cmd /c ping -n 9 127.0.0.1 >nul ^& start http://localhost:8765/?reset=1
"%NPX%" --yes serve . -l %PORT%
pause