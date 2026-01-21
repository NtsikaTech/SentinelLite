@echo off
echo.
echo ========================================
echo   SentinelLite SIEM - Full Stack
echo ========================================
echo.
echo Starting both Backend and Frontend servers...
echo.

:: Start backend in a new window
start "SentinelLite Backend" cmd /k "cd /d "%~dp0" && start-backend.bat"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "SentinelLite Frontend" cmd /k "cd /d "%~dp0" && start-frontend.bat"

echo.
echo Servers are starting in separate windows:
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul

