@echo off
echo ===========================================
echo    SmartSpend - Quick Start Script
echo ===========================================
echo.

echo [1/3] Starting Backend Server...
cd /d "%~dp0\..\backend"
echo Backend directory: %CD%
start "SmartSpend Backend" cmd /k "python app.py"

echo.
echo [2/3] Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Starting Frontend Development Server...
cd /d "%~dp0\..\frontend"
echo Frontend directory: %CD%
start "SmartSpend Frontend" cmd /k "npm run dev"

echo.
echo ===========================================
echo    System Started Successfully!
echo ===========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul