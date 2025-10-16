Write-Host "Deploying Firebase Security Rules..." -ForegroundColor Green
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Firebase CLI not found"
    }
    Write-Host "Firebase CLI version: $firebaseVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Firebase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g firebase-tools" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Deploy the rules
Write-Host "Deploying Firestore rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Firebase rules deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The admin functions should now work properly." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Failed to deploy Firebase rules." -ForegroundColor Red
    Write-Host "Please check your Firebase configuration and try again." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

