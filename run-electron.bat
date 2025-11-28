@echo off
echo ========================================
echo Hand Gesture Control - Electron Launcher
echo ========================================
echo.
echo Building application...
call npm run build
echo.
echo Starting Electron...
call electron electron/main.js
pause
