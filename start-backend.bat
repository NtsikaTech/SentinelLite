@echo off
echo.
echo ========================================
echo   SentinelLite SIEM - Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

:: Install dependencies if not already installed
echo Installing Python dependencies...
python -m pip install -r requirements.txt --quiet

echo.
echo Starting Flask backend server on http://localhost:5000
echo.

python app.py

