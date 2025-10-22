const { seedDatabase } = require('./utils/seedData.js');

console.log('🌱 Seeding database with your local images...');
console.log('📦 Products include:');
console.log('   👟 Nike Air Max 270 (Shoes)');
console.log('   👗 Elegant Summer Dress');
console.log('   👕 Crop Tops');
console.log('   👖 Wide Leg Pants');
console.log('   💄 Lipstick Sets');
console.log('   🎨 Makeup Brushes');
console.log('   ✨ Setting Powders');
console.log('   📱 Electronics');
console.log('   🏠 Home & More!');
console.log('');

seedDatabase()
  .then(() => {
    console.log('✅ Database seeded successfully with your local images!');
    console.log('🟠 All products now use your orange and white color scheme');
    console.log('🚀 You can now see your products in the ShopEase app!');
  })
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
  });









