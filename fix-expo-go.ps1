# Fix Expo Go Connection Script for PowerShell
# This script fixes common Expo Go connection issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Fixing Expo Go Connection Issues" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "📁 Changed to project directory" -ForegroundColor Green
Write-Host ""

# Stop any existing processes
Write-Host "🛑 Stopping any existing processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "expo" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped existing processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No existing processes to stop" -ForegroundColor Blue
}

Write-Host ""

# Clear all caches
Write-Host "🧹 Clearing all caches..." -ForegroundColor Yellow
try {
    # Clear npm cache
    npm cache clean --force
    Write-Host "✅ Cleared npm cache" -ForegroundColor Green
    
    # Clear Expo cache
    npx expo install --fix
    Write-Host "✅ Fixed Expo dependencies" -ForegroundColor Green
    
    # Clear Metro cache
    npx expo start --clear
    Write-Host "✅ Cleared Metro cache" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️  Some cache clearing failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Check network connectivity
Write-Host "🌐 Checking network connectivity..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet
    if ($ping) {
        Write-Host "✅ Internet connection is working" -ForegroundColor Green
    } else {
        Write-Host "❌ Internet connection issue detected" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Could not test internet connection" -ForegroundColor Yellow
}

Write-Host ""

# Get local IP address
Write-Host "🔍 Getting local IP address..." -ForegroundColor Yellow
try {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress
    if ($ipAddress) {
        Write-Host "✅ Local IP: $ipAddress" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not determine local IP" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not get local IP address" -ForegroundColor Yellow
}

Write-Host ""

# Start Expo with proper configuration
Write-Host "🚀 Starting Expo with optimized settings..." -ForegroundColor Yellow
Write-Host "   This should fix the 'site cannot be reached' error" -ForegroundColor Blue
Write-Host ""

try {
    # Start with tunnel mode for better connectivity
    Write-Host "📱 Starting with tunnel mode (best for Expo Go)..." -ForegroundColor Cyan
    npx expo start --tunnel --clear
} catch {
    Write-Host "❌ Tunnel mode failed, trying LAN mode..." -ForegroundColor Red
    try {
        npx expo start --lan --clear
    } catch {
        Write-Host "❌ LAN mode failed, trying local mode..." -ForegroundColor Red
        npx expo start --localhost --clear
    }
}

Write-Host ""
Write-Host "✅ Expo server should now be running!" -ForegroundColor Green
Write-Host "🟠 Orange and white color scheme applied" -ForegroundColor Yellow
Write-Host "📦 Your local product images are included" -ForegroundColor Yellow
Write-Host "👨‍💼 Admin dashboard is available" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Instructions for Expo Go:" -ForegroundColor Cyan
Write-Host "   1. Install 'Expo Go' app from Play Store" -ForegroundColor White
Write-Host "   2. Make sure your phone and computer are on the same WiFi" -ForegroundColor White
Write-Host "   3. Scan the QR code that appears above" -ForegroundColor White
Write-Host "   4. If QR code doesn't work, try typing the URL manually" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop the server: Press Ctrl+C" -ForegroundColor Red


