Write-Host "Starting ShopEase..." -ForegroundColor Green
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "Package.json found!" -ForegroundColor Green
    Write-Host "Starting Expo development server..." -ForegroundColor Cyan
    npx expo start --port 8082
} else {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
}


