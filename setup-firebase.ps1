Write-Host "Setting up Firebase for ShopEase..." -ForegroundColor Green
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Firebase CLI not found"
    }
    Write-Host "Firebase CLI version: $firebaseVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Firebase CLI is not installed. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Firebase CLI. Please install manually:" -ForegroundColor Red
        Write-Host "npm install -g firebase-tools" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Please follow these steps to fix the cart permission error:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login to Firebase:" -ForegroundColor Yellow
Write-Host "   firebase login" -ForegroundColor White
Write-Host ""
Write-Host "2. Set the project:" -ForegroundColor Yellow
Write-Host "   firebase use gelcastore" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy the rules:" -ForegroundColor Yellow
Write-Host "   firebase deploy --only firestore:rules" -ForegroundColor White
Write-Host ""
Write-Host "4. Deploy storage rules:" -ForegroundColor Yellow
Write-Host "   firebase deploy --only storage" -ForegroundColor White
Write-Host ""
Write-Host "Alternative: You can also deploy rules through the Firebase Console:" -ForegroundColor Cyan
Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Select your project: gelcastore" -ForegroundColor White
Write-Host "3. Go to Firestore Database > Rules" -ForegroundColor White
Write-Host "4. Copy the content from firestore.rules file" -ForegroundColor White
Write-Host "5. Paste and publish the rules" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"








