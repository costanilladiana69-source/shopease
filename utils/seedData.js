import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

export const sampleProducts = [
  // Shoes
  {
    name: "Nike Air Max 270",
    brand: "Nike",
    category: "sports",
    price: 150,
    originalPrice: 180,
    description: "Comfortable and stylish Nike Air Max 270 with excellent cushioning and breathable design. Perfect for daily wear and light exercise.",
    images: [
      '../assets/images/nikes.avif',
    ],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black", "White", "Blue", "Red"],
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    featured: true,
  },
  
  // Clothing
  {
    name: "Elegant Summer Dress",
    brand: "Fashion Forward",
    category: "clothing",
    price: 89,
    originalPrice: 120,
    description: "Beautiful summer dress perfect for any occasion. Made with high-quality fabric and elegant design.",
    images: [
      '../assets/images/dress.avif',
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blue", "Pink", "Black", "White"],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    featured: true,
  },
  
  {
    name: "Crop Top - Casual Style",
    brand: "Trendy Wear",
    category: "clothing",
    price: 35,
    originalPrice: 45,
    description: "Comfortable and stylish crop top perfect for casual outings. Made with soft, breathable material.",
    images: [
      '../assets/images/crop top1.jpg',
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Black", "Pink", "Blue"],
    rating: 4.4,
    reviewCount: 67,
    inStock: true,
    featured: false,
  },
  
  {
    name: "Wide Leg Pants",
    brand: "Comfort Style",
    category: "clothing",
    price: 65,
    originalPrice: 85,
    description: "Trendy wide leg pants that are both comfortable and fashionable. Perfect for office or casual wear.",
    images: [
      '../assets/images/wide leg pants 1.jpg',
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Beige", "Gray"],
    rating: 4.5,
    reviewCount: 43,
    inStock: true,
    featured: false,
  },
  
  // Beauty Products
  {
    name: "Premium Lipstick Set",
    brand: "Beauty Luxe",
    category: "beauty",
    price: 45,
    originalPrice: 60,
    description: "High-quality lipstick set with long-lasting color and moisturizing formula. Perfect for any occasion.",
    images: [
      '../assets/images/lipstick 1.avif',
    ],
    sizes: ["Full Size"],
    colors: ["Red", "Pink", "Nude", "Berry"],
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    featured: true,
  },
  
  {
    name: "Setting Powder",
    brand: "Glow Beauty",
    category: "beauty",
    price: 28,
    originalPrice: 35,
    description: "Professional setting powder for a flawless, long-lasting makeup look. Lightweight and non-cakey formula.",
    images: [
      '../assets/images/powder 1.jpg',
    ],
    sizes: ["Light", "Medium", "Dark"],
    colors: ["Translucent", "Light", "Medium", "Dark"],
    rating: 4.6,
    reviewCount: 178,
    inStock: true,
    featured: false,
  },
  
  {
    name: "Makeup Brush Set",
    brand: "Pro Tools",
    category: "beauty",
    price: 55,
    originalPrice: 75,
    description: "Professional makeup brush set with soft, synthetic bristles. Perfect for flawless makeup application.",
    images: [
      '../assets/images/brush1.webp',
    ],
    sizes: ["Set of 8"],
    colors: ["Black", "Pink", "Gold"],
    rating: 4.7,
    reviewCount: 145,
    inStock: true,
    featured: false,
  },
  
  // Electronics
  {
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: "electronics",
    price: 999,
    originalPrice: 1099,
    description: "The latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Perfect for photography and productivity.",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
    ],
    sizes: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
    rating: 4.8,
    reviewCount: 324,
    inStock: true,
    featured: true,
  },
  {
    name: "MacBook Air M2",
    brand: "Apple",
    category: "electronics",
    price: 1199,
    originalPrice: 1299,
    description: "Ultra-thin laptop with M2 chip, 13.6-inch Liquid Retina display, and all-day battery life. Perfect for work and creativity.",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
    ],
    sizes: ["8GB RAM", "16GB RAM", "24GB RAM"],
    colors: ["Space Gray", "Silver", "Starlight", "Midnight"],
    rating: 4.7,
    reviewCount: 189,
    inStock: true,
    featured: true,
  },
  {
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    category: "electronics",
    price: 799,
    originalPrice: 899,
    description: "Premium Android smartphone with AI-powered features, stunning display, and professional-grade camera system.",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"
    ],
    sizes: ["128GB", "256GB", "512GB"],
    colors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"],
    rating: 4.6,
    reviewCount: 267,
    inStock: true,
    featured: false,
  },

  // Clothing
  {
    name: "Classic Denim Jacket",
    brand: "Levi's",
    category: "clothing",
    price: 89,
    originalPrice: 120,
    description: "Timeless denim jacket made from premium cotton. Perfect for layering and adding style to any outfit.",
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Black", "Light Blue", "White"],
    rating: 4.4,
    reviewCount: 156,
    inStock: true,
    featured: true,
  },
  {
    name: "Cotton T-Shirt",
    brand: "Uniqlo",
    category: "clothing",
    price: 19,
    originalPrice: 25,
    description: "Soft, comfortable cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Gray", "Navy", "Red", "Green"],
    rating: 4.2,
    reviewCount: 423,
    inStock: true,
    featured: false,
  },
  {
    name: "Wool Sweater",
    brand: "Patagonia",
    category: "clothing",
    price: 129,
    originalPrice: 159,
    description: "Warm and cozy wool sweater made from sustainable materials. Perfect for cold weather and outdoor activities.",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Cream", "Charcoal", "Forest Green", "Burgundy"],
    rating: 4.5,
    reviewCount: 98,
    inStock: true,
    featured: false,
  },

  // Home
  {
    name: "Smart Home Speaker",
    brand: "Amazon",
    category: "home",
    price: 99,
    originalPrice: 129,
    description: "Voice-controlled smart speaker with Alexa. Stream music, control smart home devices, and get information hands-free.",
    images: [
      "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"
    ],
    sizes: ["Standard", "Plus", "Studio"],
    colors: ["Charcoal", "Sandstone", "Heather Gray", "Ocean Blue"],
    rating: 4.3,
    reviewCount: 567,
    inStock: true,
    featured: true,
  },
  {
    name: "Coffee Maker",
    brand: "Breville",
    category: "home",
    price: 199,
    originalPrice: 249,
    description: "Professional-grade coffee maker with precise temperature control and built-in grinder. Perfect for coffee enthusiasts.",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500"
    ],
    sizes: ["8 Cup", "12 Cup"],
    colors: ["Stainless Steel", "Black", "White"],
    rating: 4.6,
    reviewCount: 234,
    inStock: true,
    featured: false,
  },
  {
    name: "Throw Pillow Set",
    brand: "West Elm",
    category: "home",
    price: 49,
    originalPrice: 69,
    description: "Decorative throw pillow set with modern geometric patterns. Adds style and comfort to any living space.",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"
    ],
    sizes: ["18x18", "20x20", "22x22"],
    colors: ["Navy & White", "Gray & Gold", "Blush & Cream", "Black & White"],
    rating: 4.1,
    reviewCount: 89,
    inStock: true,
    featured: false,
  },

  // Books
  {
    name: "The Psychology of Money",
    brand: "Morgan Housel",
    category: "books",
    price: 16,
    originalPrice: 20,
    description: "Timeless lessons on wealth, greed, and happiness. A must-read for anyone interested in personal finance and investing.",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"
    ],
    sizes: ["Paperback", "Hardcover", "E-book"],
    colors: ["N/A"],
    rating: 4.7,
    reviewCount: 1234,
    inStock: true,
    featured: true,
  },
  {
    name: "Atomic Habits",
    brand: "James Clear",
    category: "books",
    price: 18,
    originalPrice: 22,
    description: "An easy and proven way to build good habits and break bad ones. Transform your life with small changes.",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"
    ],
    sizes: ["Paperback", "Hardcover", "E-book"],
    colors: ["N/A"],
    rating: 4.8,
    reviewCount: 2156,
    inStock: true,
    featured: false,
  },

  // Sports
  {
    name: "Yoga Mat",
    brand: "Lululemon",
    category: "sports",
    price: 68,
    originalPrice: 88,
    description: "Premium yoga mat with superior grip and cushioning. Perfect for all types of yoga and fitness activities.",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
      "https://images.unsplash.com/photo-1506629905607-1b2b1b1b1b1b?w=500"
    ],
    sizes: ["Standard", "Long", "Extra Long"],
    colors: ["Purple", "Pink", "Blue", "Black", "Gray"],
    rating: 4.5,
    reviewCount: 345,
    inStock: true,
    featured: true,
  },
  {
    name: "Running Shoes",
    brand: "Nike",
    category: "sports",
    price: 120,
    originalPrice: 150,
    description: "Lightweight running shoes with responsive cushioning and breathable upper. Perfect for daily runs and training.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"
    ],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["White", "Black", "Blue", "Red", "Green"],
    rating: 4.4,
    reviewCount: 456,
    inStock: true,
    featured: false,
  },

  // Beauty
  {
    name: "Moisturizing Cream",
    brand: "CeraVe",
    category: "beauty",
    price: 24,
    originalPrice: 30,
    description: "Daily moisturizing cream with hyaluronic acid and ceramides. Suitable for all skin types, including sensitive skin.",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500"
    ],
    sizes: ["50ml", "100ml", "150ml"],
    colors: ["N/A"],
    rating: 4.6,
    reviewCount: 789,
    inStock: true,
    featured: true,
  },
  {
    name: "Lipstick Set",
    brand: "MAC",
    category: "beauty",
    price: 45,
    originalPrice: 60,
    description: "Professional lipstick set with 6 classic shades. Long-lasting formula with rich, vibrant colors.",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500"
    ],
    sizes: ["Set of 6"],
    colors: ["Red", "Pink", "Nude", "Berry", "Coral", "Plum"],
    rating: 4.3,
    reviewCount: 234,
    inStock: true,
    featured: false,
  },

  // Toys
  {
    name: "LEGO Creator Set",
    brand: "LEGO",
    category: "toys",
    price: 79,
    originalPrice: 99,
    description: "Creative building set with 3 different models to build. Encourages creativity and problem-solving skills.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
    ],
    sizes: ["Ages 8+", "Ages 12+", "Ages 16+"],
    colors: ["N/A"],
    rating: 4.7,
    reviewCount: 567,
    inStock: true,
    featured: true,
  },
  {
    name: "Board Game Collection",
    brand: "Hasbro",
    category: "toys",
    price: 35,
    originalPrice: 45,
    description: "Classic board game collection including Monopoly, Scrabble, and Clue. Perfect for family game nights.",
    images: [
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500",
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500"
    ],
    sizes: ["2-4 Players", "2-6 Players", "2-8 Players"],
    colors: ["N/A"],
    rating: 4.4,
    reviewCount: 123,
    inStock: true,
    featured: false,
  },

  // Automotive
  {
    name: "Car Phone Mount",
    brand: "iOttie",
    category: "automotive",
    price: 29,
    originalPrice: 39,
    description: "Secure phone mount for car dashboard. One-touch release mechanism and 360-degree rotation for optimal viewing.",
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500"
    ],
    sizes: ["Universal"],
    colors: ["Black", "Gray", "White"],
    rating: 4.2,
    reviewCount: 678,
    inStock: true,
    featured: false,
  },
  {
    name: "Car Air Freshener",
    brand: "Febreze",
    category: "automotive",
    price: 8,
    originalPrice: 12,
    description: "Long-lasting car air freshener with fresh scent. Easy to use and provides continuous fragrance for up to 30 days.",
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500"
    ],
    sizes: ["Single", "Pack of 3", "Pack of 6"],
    colors: ["Ocean", "Lavender", "Vanilla", "Citrus"],
    rating: 4.0,
    reviewCount: 234,
    inStock: true,
    featured: false,
  },

  // Additional Products with Local Images
  {
    name: "Liquid Lipstick",
    brand: "Beauty Luxe",
    category: "beauty",
    price: 25,
    originalPrice: 35,
    description: "Long-lasting liquid lipstick with matte finish. Highly pigmented and comfortable to wear all day.",
    images: [
      '../assets/images/liptisk 2.jpg',
    ],
    sizes: ["Full Size"],
    colors: ["Red", "Pink", "Nude", "Berry", "Coral"],
    rating: 4.5,
    reviewCount: 98,
    inStock: true,
    featured: false,
  },
  
  {
    name: "Loose Setting Powder",
    brand: "Glow Beauty",
    category: "beauty",
    price: 32,
    originalPrice: 42,
    description: "Loose setting powder for a flawless finish. Controls shine and extends makeup wear time.",
    images: [
      '../assets/images/powder 2.webp',
    ],
    sizes: ["Light", "Medium", "Dark"],
    colors: ["Translucent", "Light", "Medium", "Dark"],
    rating: 4.7,
    reviewCount: 123,
    inStock: true,
    featured: false,
  },
  
  {
    name: "Professional Brush Set",
    brand: "Pro Tools",
    category: "beauty",
    price: 48,
    originalPrice: 65,
    description: "Professional makeup brush set with premium synthetic bristles. Essential tools for perfect makeup application.",
    images: [
      '../assets/images/brush2.webp',
    ],
    sizes: ["Set of 6"],
    colors: ["Black", "Rose Gold", "Silver"],
    rating: 4.6,
    reviewCount: 87,
    inStock: true,
    featured: false,
  },
  
  {
    name: "Crop Top - Premium",
    brand: "Trendy Wear",
    category: "clothing",
    price: 42,
    originalPrice: 55,
    description: "Premium quality crop top with elegant design. Perfect for both casual and semi-formal occasions.",
    images: [
      '../assets/images/crop top 2.webp',
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Black", "Navy", "Cream"],
    rating: 4.3,
    reviewCount: 54,
    inStock: true,
    featured: false,
  },
  
  {
    name: "Wide Leg Pants - Premium",
    brand: "Comfort Style",
    category: "clothing",
    price: 75,
    originalPrice: 95,
    description: "Premium wide leg pants with superior comfort and style. Made with high-quality fabric for all-day wear.",
    images: [
      '../assets/images/wide leg pants 2.webp',
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Beige", "Charcoal"],
    rating: 4.8,
    reviewCount: 76,
    inStock: true,
    featured: true,
  }
];

export const seedDatabase = async () => {
  try {
    console.log('Starting to seed database...');
    
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
