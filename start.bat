@echo off
echo.
echo 🛍️ Starting ShopEase E-Commerce Platform...
echo ===============================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully!
)

echo 🚀 Starting Expo development server...
echo ===============================================
echo.
echo 📱 To access your app:
echo    • Install 'Expo Go' on your mobile device
echo    • Scan the QR code that appears below
echo    • Or press 'w' to open in web browser
echo    • Or press 'a' for Android emulator
echo    • Or press 'i' for iOS simulator
echo.
echo 🛑 Press Ctrl+C to stop the server
echo ===============================================
echo.

REM Start Expo with a specific port to avoid conflicts
npx expo start --port 8082 --clear





