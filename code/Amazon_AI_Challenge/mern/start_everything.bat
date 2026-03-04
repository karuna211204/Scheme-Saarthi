@echo off
echo.
echo =================================================================
echo   🚀 Starting Scheme Saarthi with OCR Integration
echo =================================================================
echo.

set "PROJECT_ROOT=%~dp0.."
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"
set "OCR_SERVICE_DIR=%BACKEND_DIR%\ocr_service"

echo [INFO] Project directories:
echo   📁 Backend: %BACKEND_DIR%
echo   📁 Frontend: %FRONTEND_DIR%
echo   📁 OCR Service: %OCR_SERVICE_DIR%
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] ✅ Node.js found
node --version
echo.

:: Start the backend server
echo [STEP 1] 🔧 Starting Backend Server...
cd /d "%BACKEND_DIR%"
start "Backend Server" cmd /k "echo [BACKEND SERVER STARTING] && npm start"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Try to start OCR service (optional)
echo [STEP 2] 🤖 Attempting to start OCR Service...
if exist "%OCR_SERVICE_DIR%\setup_and_start.bat" (
    cd /d "%OCR_SERVICE_DIR%"
    start "OCR Service" cmd /k "echo [OCR SERVICE - This is optional] && call setup_and_start.bat"
    echo [INFO] ✅ OCR Service starting in separate window
) else (
    echo [INFO] ⚠️  OCR Service files not found - Demo data will be used
)

:: Wait a moment for services to start
timeout /t 3 /nobreak >nul

:: Start the frontend
echo [STEP 3] 🌐 Starting Frontend...
cd /d "%FRONTEND_DIR%"
start "Frontend" cmd /k "echo [FRONTEND STARTING] && npm start"

echo.
echo =================================================================
echo   🎉 All Services Starting!
echo =================================================================
echo.
echo The following should be starting:
echo   🔧 Backend Server: http://localhost:5000
echo   🤖 OCR Service: http://localhost:5001 (optional)  
echo   🌐 Frontend: http://localhost:3000
echo.
echo 📋 To test OCR integration:
echo   1. Open the frontend at http://localhost:3000
echo   2. Navigate to Profile page
echo   3. Click "Scan Aadhaar" button
echo   4. Upload any image - you'll get demo data if OCR service isn't running
echo.
echo 💡 Tip: If OCR service fails to start, the app will still work with demo data!
echo.
pause