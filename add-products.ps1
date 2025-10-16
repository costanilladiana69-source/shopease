# Add Products Script for PowerShell
# This script adds your local product images to the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Adding Your Products to ShopEase" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "📁 Changed to project directory" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Adding products with your local images:" -ForegroundColor Yellow
Write-Host "   👟 Nike Air Max 270 (Shoes)" -ForegroundColor White
Write-Host "   👗 Elegant Summer Dress" -ForegroundColor White
Write-Host "   👕 Crop Tops" -ForegroundColor White
Write-Host "   👖 Wide Leg Pants" -ForegroundColor White
Write-Host "   💄 Lipstick Sets" -ForegroundColor White
Write-Host "   🎨 Makeup Brushes" -ForegroundColor White
Write-Host "   ✨ Setting Powders" -ForegroundColor White
Write-Host "   📱 Electronics" -ForegroundColor White
Write-Host "   🏠 Home & More!" -ForegroundColor White
Write-Host ""

try {
    # Run the seeding script
    node -e "
    const { seedDatabase } = require('./utils/seedData.js');
    console.log('🌱 Seeding database with your products...');
    seedDatabase()
      .then(() => {
        console.log('✅ Products added successfully!');
        console.log('🟠 All using orange and white colors');
        console.log('🚀 Check your ShopEase app now!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error adding products:', error);
        process.exit(1);
      });
    "
    
    Write-Host ""
    Write-Host "✅ Products added successfully!" -ForegroundColor Green
    Write-Host "🟠 All products use orange and white colors" -ForegroundColor Yellow
    Write-Host "🚀 You can now see your products in the app!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error adding products. Please check the error above." -ForegroundColor Red
    Write-Host "💡 Make sure Firebase is properly configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

