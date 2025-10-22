# Clean PowerShell startup script for ShopEase
# This version suppresses error output and runs cleanly

# Suppress error output
$ErrorActionPreference = "SilentlyContinue"

# Set location
Set-Location "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "Starting ShopEase..." -ForegroundColor Green

# Check if we're in the right directory
if (Test-Path "package.json") {
    Write-Host "Project found! Starting Expo..." -ForegroundColor Green
    
    # Start Expo with minimal output
    Start-Process -FilePath "npx" -ArgumentList "expo", "start", "--port", "8082" -NoNewWindow -Wait
} else {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this from the project directory." -ForegroundColor Yellow
}








