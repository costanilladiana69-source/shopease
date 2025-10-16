# Direct PowerShell runner for ShopEase
# This bypasses all PowerShell execution issues

# Clear screen
Clear-Host

Write-Host "🛍️ ShopEase E-Commerce Platform" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Orange
Write-Host ""

# Navigate to project
Set-Location "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "✅ Project directory: $(Get-Location)" -ForegroundColor Green

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ Project files found" -ForegroundColor Green
} else {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""
Write-Host "📱 Access your app:" -ForegroundColor White
Write-Host "   • Mobile: Install 'Expo Go' and scan QR code" -ForegroundColor Gray
Write-Host "   • Web: Press 'w' in the terminal below" -ForegroundColor Gray
Write-Host "   • Android: Press 'a' in the terminal below" -ForegroundColor Gray
Write-Host "   • iOS: Press 'i' in the terminal below" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""

# Use cmd to run npx expo start (bypasses PowerShell issues)
cmd /c "npx expo start --port 8082"


