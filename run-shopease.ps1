# ShopEase PowerShell Launcher
# This script ensures ShopEase runs properly in PowerShell

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Clear screen and show header
Clear-Host
Write-Host "🛍️ ShopEase E-Commerce Platform" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Orange
Write-Host ""

# Set project path
$projectPath = "C:\Users\Gwapo\Downloads\shopease\shopease"

# Navigate to project
try {
    Set-Location $projectPath
    Write-Host "✅ Navigated to project directory" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Cannot navigate to project directory" -ForegroundColor Red
    Write-Host "Path: $projectPath" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ Project files found" -ForegroundColor Green
} else {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please check the project path." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "❌ Error: npm not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
        } else {
            throw "npm install failed"
        }
    } catch {
        Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Display instructions
Write-Host ""
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""
Write-Host "📱 How to access your ShopEase app:" -ForegroundColor White
Write-Host "   • Mobile: Install 'Expo Go' app and scan QR code" -ForegroundColor Gray
Write-Host "   • Web Browser: Press 'w' in the terminal below" -ForegroundColor Gray
Write-Host "   • Android Emulator: Press 'a' in the terminal below" -ForegroundColor Gray
Write-Host "   • iOS Simulator: Press 'i' in the terminal below" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop the server: Press Ctrl+C" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Orange
Write-Host ""

# Start Expo server
Write-Host "🔄 Launching Expo..." -ForegroundColor Cyan
Write-Host ""

try {
    # Use Start-Process to run Expo in a new window to avoid PowerShell output issues
    Start-Process -FilePath "npx" -ArgumentList "expo", "start", "--port", "8082" -NoNewWindow -Wait
} catch {
    Write-Host "❌ Error starting Expo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use cmd to run the command
    try {
        cmd /c "npx expo start --port 8082"
    } catch {
        Write-Host "❌ Failed to start Expo with alternative method" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Expo server stopped" -ForegroundColor Green
Read-Host "Press Enter to exit"








