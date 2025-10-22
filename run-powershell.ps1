# ShopEase PowerShell Runner - Bypasses terminal output issues
# This script runs the project in PowerShell without display errors

param(
    [switch]$Web,
    [switch]$Android,
    [switch]$IOS
)

# Clear any existing errors
$Error.Clear()

# Set working directory
Set-Location -Path "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "🛍️ ShopEase E-Commerce Platform" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Orange
Write-Host ""

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Project directory found" -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = & node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = & npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "❌ Error: npm not available" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    & npm install 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""
Write-Host "📱 Access your app:" -ForegroundColor White
Write-Host "   • Mobile: Install 'Expo Go' and scan QR code" -ForegroundColor Gray
Write-Host "   • Web: Press 'w' in the terminal" -ForegroundColor Gray
Write-Host "   • Android: Press 'a' in the terminal" -ForegroundColor Gray
Write-Host "   • iOS: Press 'i' in the terminal" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""

# Start Expo with error suppression
try {
    if ($Web) {
        & npx expo start --web 2>$null
    } elseif ($Android) {
        & npx expo start --android 2>$null
    } elseif ($IOS) {
        & npx expo start --ios 2>$null
    } else {
        & npx expo start --port 8082 2>$null
    }
} catch {
    Write-Host "❌ Error starting Expo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}








