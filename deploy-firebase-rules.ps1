# Firebase Rules Deployment Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Firebase Rules Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Firebase CLI not found"
    }
    Write-Host "Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Firebase CLI is not installed!" -ForegroundColor Red
    Write-Host "Please install it first: npm install -g firebase-tools" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Proceeding with deployment..." -ForegroundColor Green
Write-Host ""

# Check Firebase authentication
Write-Host "Checking Firebase authentication..." -ForegroundColor Yellow
try {
    firebase projects:list 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-Host "Firebase authentication verified." -ForegroundColor Green
} catch {
    Write-Host "Please login to Firebase..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Firebase login failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# Deploy Firestore rules
Write-Host "Deploying Firestore rules..." -ForegroundColor Yellow
try {
    firebase deploy --only firestore:rules
    if ($LASTEXITCODE -ne 0) {
        throw "Firestore deployment failed"
    }
    Write-Host "Firestore rules deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Firestore rules deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Deploy Storage rules
Write-Host "Deploying Storage rules..." -ForegroundColor Yellow
try {
    firebase deploy --only storage
    if ($LASTEXITCODE -ne 0) {
        throw "Storage deployment failed"
    }
    Write-Host "Storage rules deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Storage rules deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Deployment completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Rules have been deployed to your Firebase project." -ForegroundColor Green
Write-Host "You can verify them in the Firebase Console:" -ForegroundColor Yellow
Write-Host "- Firestore: https://console.firebase.google.com/project/gelcastore/firestore/rules" -ForegroundColor Blue
Write-Host "- Storage: https://console.firebase.google.com/project/gelcastore/storage/rules" -ForegroundColor Blue
Write-Host ""
Read-Host "Press Enter to exit"








