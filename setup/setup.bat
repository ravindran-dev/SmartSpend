@echo off
echo Setting up SmartSpend ML Bill Extraction...
echo.

echo Step 1: Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing Python dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Node.js dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo Error installing Node.js dependencies!
    pause
    exit /b 1
)

echo.
echo ============================================
echo Setup completed successfully!
echo.
echo To run the application:
echo 1. Start backend: cd backend && python app.py
echo 2. Start frontend: cd frontend && npm start
echo.
echo Note: Make sure Tesseract OCR is installed
echo Download from: https://github.com/UB-Mannheim/tesseract/wiki
echo ============================================
pause