@echo off
echo Deploying Firebase Security Rules...
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Deploy the rules
echo Deploying Firestore rules...
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo.
    echo ✅ Firebase rules deployed successfully!
    echo.
    echo The admin functions should now work properly.
) else (
    echo.
    echo ❌ Failed to deploy Firebase rules.
    echo Please check your Firebase configuration and try again.
)

echo.
pause

