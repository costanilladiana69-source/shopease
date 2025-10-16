# Fix Expo Go Connection Issues
Write-Host "🔧 Fixing Expo Go Connection Issues..." -ForegroundColor Orange
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Make sure you're in the shopease directory." -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Please run: cd shopease" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found package.json in: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Kill any existing Expo processes
Write-Host "🔄 Stopping any existing Expo processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped existing Expo processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No existing Expo processes found" -ForegroundColor Blue
}

# Clear Expo cache
Write-Host "🧹 Clearing Expo cache..." -ForegroundColor Yellow
try {
    npx expo r -c
    Write-Host "✅ Cache cleared" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Cache clear completed" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🚀 Starting Expo with tunnel mode..." -ForegroundColor Green
Write-Host "   This will create a public URL that works from anywhere" -ForegroundColor Cyan
Write-Host ""

# Start Expo with tunnel
try {
    npx expo start --tunnel --clear
} catch {
    Write-Host "❌ Tunnel mode failed. Trying local network..." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Starting with local network..." -ForegroundColor Yellow
    npx expo start --clear
}
