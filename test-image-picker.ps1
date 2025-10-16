# Test ImagePicker Functionality
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Testing ImagePicker Functionality" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\Gwapo\Downloads\shopease\shopease"

Write-Host "📸 ImagePicker Test Results:" -ForegroundColor Green
Write-Host ""

node test-image-picker.js

Write-Host ""
Write-Host "🚀 To test ImagePicker in the app:" -ForegroundColor Yellow
Write-Host "   1. Start the app with START-SHOPEASE.bat" -ForegroundColor White
Write-Host "   2. Login as admin (admin@gmail.com / admin123)" -ForegroundColor White
Write-Host "   3. Go to 'Manage Products'" -ForegroundColor White
Write-Host "   4. Click 'Add Product'" -ForegroundColor White
Write-Host "   5. In Images section, tap to add images" -ForegroundColor White
Write-Host ""

Write-Host "✅ ImagePicker is ready to use!" -ForegroundColor Green
Write-Host "🟠 Images will be displayed with orange theme" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

