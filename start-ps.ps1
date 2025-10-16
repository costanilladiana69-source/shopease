# ShopEase PowerShell Startup Script
# This script bypasses PowerShell terminal output issues

# Clear the screen
Clear-Host

# Display header
Write-Host "🛍️ ShopEase E-Commerce Platform" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Orange
Write-Host ""

# Change to project directory
$projectPath = "C:\Users\Gwapo\Downloads\shopease\shopease"
Set-Location $projectPath

# Verify we're in the right place
if (Test-Path "package.json") {
    Write-Host "✅ Project directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please check the project path." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    Write-Host "✅ Node.js is available" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install Node.js" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck) {
    Write-Host "✅ npm is available" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""
Write-Host "📱 To access your app:" -ForegroundColor White
Write-Host "   • Install 'Expo Go' on your mobile device" -ForegroundColor Gray
Write-Host "   • Scan the QR code that appears below" -ForegroundColor Gray
Write-Host "   • Or press 'w' to open in web browser" -ForegroundColor Gray
Write-Host "   • Or press 'a' for Android emulator" -ForegroundColor Gray
Write-Host "   • Or press 'i' for iOS simulator" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""

# Start Expo using Invoke-Expression to bypass terminal issues
try {
    Invoke-Expression "npx expo start --port 8082"
} catch {
    Write-Host "❌ Error starting Expo: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}


