@echo off
title Seed ShopEase with Your Local Images
color 0A

echo.
echo ========================================
echo    Seeding ShopEase with Your Local
echo    Images and Products
echo ========================================
echo.

REM Change to project directory
cd /d "C:\Users\Gwapo\Downloads\shopease\shopease"

echo Adding your products to the database...
echo.
echo Products being added:
echo   👟 Nike Air Max 270 (Shoes)
echo   👗 Elegant Summer Dress  
echo   👕 Crop Tops
echo   👖 Wide Leg Pants
echo   💄 Lipstick Sets
echo   🎨 Makeup Brushes
echo   ✨ Setting Powders
echo   📱 Electronics
echo   🏠 Home & More!
echo.

node seed-with-local-images.js

echo.
echo ✅ Products added successfully!
echo 🟠 All using orange and white colors
echo 🚀 Check your ShopEase app now!
echo.
pause



