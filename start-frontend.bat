@echo off
echo.
echo ========================================
echo   SentinelLite SIEM - Frontend Server
echo ========================================
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing NPM dependencies...
    npm install
)

echo.
echo Starting Vite dev server on http://localhost:3000
echo.

npm run dev

