@echo off
title Fix Expo Go Connection Issues
color 0A

echo.
echo ========================================
echo    Fixing Expo Go Connection Issues
echo ========================================
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "fix-expo-go.ps1"

pause

