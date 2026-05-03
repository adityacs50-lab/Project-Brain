@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo    Starting Company Brain System
echo ==========================================

:: Start Backend
echo [1/2] Starting Backend Server...
start "Company Brain Backend" cmd /k "..\.venv\Scripts\python.exe run_server.py"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend
echo [2/2] Starting Next.js Frontend...
cd next-app
start "Company Brain Frontend" cmd /k "npm run dev"

echo.
echo ==========================================
echo    Backend and Frontend are starting!
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:3000
echo ==========================================
echo.
pause
