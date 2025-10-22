@echo off
echo.
echo ========================================
echo    🚀 Starting ShopEase Expo Server
echo ========================================
echo.

cd /d "%~dp0"

echo ✅ Current directory: %CD%
echo.

echo 🔄 Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🧹 Clearing cache...
npx expo r -c >nul 2>&1

echo.
echo 🚀 Starting Expo server...
echo.
echo 📱 Instructions:
echo    1. Wait for QR code to appear
echo    2. Open Expo Go app on your phone
echo    3. Scan the QR code
echo    4. If QR doesn't work, try tunnel mode:
echo       Press 's' then 't' in this terminal
echo.
echo 🌐 Web version: Press 'w' to open in browser
echo.
echo ========================================
echo.

npx expo start --clear

pause








