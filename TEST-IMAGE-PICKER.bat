@echo off
title Test ImagePicker Functionality
color 0A

echo.
echo ========================================
echo    Testing ImagePicker Functionality
echo ========================================
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "test-image-picker.ps1"

pause


