@echo off
title ShopEase E-Commerce Platform
color 0A

echo.
echo ========================================
echo    ShopEase E-Commerce Platform
echo ========================================
echo.

REM Change to project directory
cd /d "C:\Users\Gwapo\Downloads\shopease\shopease"

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please check the project path.
    pause
    exit /b 1
)

echo Project found! Starting Expo...
echo.

REM Start Expo using cmd (bypasses PowerShell issues)
echo Starting Expo development server...
echo.
echo To access your app:
echo   - Mobile: Install 'Expo Go' and scan QR code
echo   - Web: Press 'w' in the terminal below
echo   - Android: Press 'a' in the terminal below
echo   - iOS: Press 'i' in the terminal below
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npx expo start --port 8082

pause









