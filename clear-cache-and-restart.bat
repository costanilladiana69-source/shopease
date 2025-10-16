@echo off
title Clear Cache and Restart ShopEase with Orange Colors
color 0A

echo.
echo ========================================
echo    Clearing Cache and Restarting
echo    ShopEase with Orange Colors
echo ========================================
echo.

REM Change to project directory
cd /d "C:\Users\Gwapo\Downloads\shopease\shopease"

echo Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Clearing all caches...
npx expo start --clear --reset-cache

echo.
echo ShopEase is now running with orange colors!
echo The app should now show "ShopEase" instead of "Stepwise"
echo and use orange colors instead of blue.
echo.
pause