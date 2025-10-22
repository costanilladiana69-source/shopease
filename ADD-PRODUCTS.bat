@echo off
title Add Your Products to ShopEase
color 0A

echo.
echo ========================================
echo    Adding Your Products to ShopEase
echo ========================================
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "add-products.ps1"

pause
