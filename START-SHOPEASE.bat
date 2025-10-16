@echo off
title Start ShopEase - Orange Colors with Your Products
color 0A

echo.
echo ========================================
echo    Starting ShopEase with Orange Colors
echo    and Your Local Product Images
echo ========================================
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "start-shopease.ps1"

pause