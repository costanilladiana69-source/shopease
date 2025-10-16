# ShopEase PowerShell Startup Script
# This script ensures the project runs properly in PowerShell

Write-Host "🛍️ Starting ShopEase E-Commerce Platform..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Orange

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: npm is not available." -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install dependencies." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}

# Check if Expo CLI is available
try {
    $expoVersion = npx expo --version
    Write-Host "✅ Expo CLI version: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Expo CLI not found. Installing globally..." -ForegroundColor Yellow
    npm install -g expo-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install Expo CLI." -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Orange
Write-Host ""
Write-Host "📱 To access your app:" -ForegroundColor Cyan
Write-Host "   • Install 'Expo Go' on your mobile device" -ForegroundColor White
Write-Host "   • Scan the QR code that appears below" -ForegroundColor White
Write-Host "   • Or press 'w' to open in web browser" -ForegroundColor White
Write-Host "   • Or press 'a' for Android emulator" -ForegroundColor White
Write-Host "   • Or press 'i' for iOS simulator" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Orange
Write-Host ""

# Start Expo with a specific port to avoid conflicts
npx expo start --port 8082 --clear


