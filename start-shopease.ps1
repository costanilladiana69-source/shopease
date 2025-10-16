# ShopEase Startup Script for PowerShell
# This script starts the Expo development server with proper configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Starting ShopEase with Orange Colors" -ForegroundColor Yellow
Write-Host "    and Your Local Product Images" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "📁 Changed to project directory" -ForegroundColor Green
Write-Host ""

# Stop any existing processes
Write-Host "🛑 Stopping any existing Expo processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "expo" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped existing processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No existing processes to stop" -ForegroundColor Blue
}

Write-Host ""

# Clear cache and start Expo
Write-Host "🚀 Starting Expo with cache clear..." -ForegroundColor Yellow
Write-Host "   This will fix the 'site cannot be reached' error" -ForegroundColor Blue
Write-Host ""

try {
    # Start Expo with tunnel mode for better connectivity
    npx expo start --clear --tunnel
} catch {
    Write-Host "❌ Error starting Expo. Trying alternative method..." -ForegroundColor Red
    Write-Host "🔄 Starting with local network..." -ForegroundColor Yellow
    npx expo start --clear --lan
}

Write-Host ""
Write-Host "✅ ShopEase is now running!" -ForegroundColor Green
Write-Host "🟠 Orange and white color scheme applied" -ForegroundColor Yellow
Write-Host "📦 Your local product images are included" -ForegroundColor Yellow
Write-Host "👨‍💼 Admin dashboard is available" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Open Expo Go app on your phone and scan the QR code" -ForegroundColor Cyan
Write-Host "🌐 Or press 'w' to open in web browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red