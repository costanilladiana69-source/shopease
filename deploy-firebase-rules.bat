@echo off
echo ========================================
echo    Firebase Rules Deployment Script
echo ========================================
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Firebase CLI is not installed!
    echo Please install it first: npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

echo Firebase CLI found. Proceeding with deployment...
echo.

REM Login to Firebase (if not already logged in)
echo Checking Firebase authentication...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Firebase...
    firebase login
    if %errorlevel% neq 0 (
        echo ERROR: Firebase login failed!
        pause
        exit /b 1
    )
)

echo.
echo Deploying Firestore rules...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ERROR: Firestore rules deployment failed!
    pause
    exit /b 1
)

echo.
echo Deploying Storage rules...
firebase deploy --only storage
if %errorlevel% neq 0 (
    echo ERROR: Storage rules deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Deployment completed successfully!
echo ========================================
echo.
echo Rules have been deployed to your Firebase project.
echo You can verify them in the Firebase Console:
echo - Firestore: https://console.firebase.google.com/project/gelcastore/firestore/rules
echo - Storage: https://console.firebase.google.com/project/gelcastore/storage/rules
echo.
pause

