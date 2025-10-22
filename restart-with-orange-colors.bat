@echo off
title Restart ShopEase with Orange Colors
color 0A

echo.
echo ========================================
echo    Restarting ShopEase with Orange
echo    and White Color Scheme
echo ========================================
echo.

REM Change to project directory
cd /d "C:\Users\Gwapo\Downloads\shopease\shopease"

echo Stopping any running Expo processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Clearing Expo cache...
npx expo start --clear

echo.
echo ShopEase is now running with orange and white colors!
echo.
pause









