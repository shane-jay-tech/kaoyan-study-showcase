@echo off
rem ============================================================
rem  Kaoyan Study Showcase - offline demo launcher (Windows)
rem  Requires Node.js 20+ (https://nodejs.org)
rem  Serves the offline demo at http://127.0.0.1:4173
rem ============================================================
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [error] Node.js was not found on PATH.
  echo Please install Node.js 20+ from https://nodejs.org and try again.
  pause
  exit /b 1
)

echo Starting the offline demo at http://127.0.0.1:4173
echo Keep this window open; press Ctrl+C to stop the server.
start "" http://127.0.0.1:4173
node serve.mjs
pause
