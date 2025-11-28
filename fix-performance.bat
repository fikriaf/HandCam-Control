@echo off
echo ========================================
echo Performance Fix for Electron
echo ========================================
echo.
echo This will:
echo 1. Enable GPU acceleration
echo 2. Set to LOW performance mode
echo 3. Rebuild the app
echo.
pause

echo.
echo Step 1: Enabling GPU...
powershell -Command "(gc electron\main.js) -replace 'app.disableHardwareAcceleration\(\);', '// app.disableHardwareAcceleration();' | Out-File -encoding ASCII electron\main.js"

echo Step 2: Setting LOW performance mode...
powershell -Command "(gc src\js\config\electronConfig.js) -replace 'PERFORMANCE_MODES.MEDIUM', 'PERFORMANCE_MODES.LOW' | Out-File -encoding ASCII src\js\config\electronConfig.js"

echo Step 3: Rebuilding...
call npm run build

echo.
echo ========================================
echo Done! Now run: npm run electron
echo ========================================
pause
