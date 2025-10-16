# Firebase Setup Guide for ShopEase

## 1. Firebase Project Configuration

### Current Firebase Project Details:
- **Project ID**: gelcastore
- **Auth Domain**: gelcastore.firebaseapp.com
- **Storage Bucket**: gelcastore.appspot.com

## 2. Firebase Console Setup

### Step 1: Authentication Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gelcastore`
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** authentication
5. Optionally enable **Anonymous** authentication for guest users

### Step 2: Firestore Database Setup
1. Navigate to **Firestore Database**
2. Create database in **production mode** (we'll add rules)
3. Choose a location (preferably close to your users)
4. Go to **Rules** tab and replace with the content from `firestore.rules`

### Step 3: Firebase Storage Setup
1. Navigate to **Storage**
2. Get started with **production mode**
3. Choose a location (same as Firestore)
4. Go to **Rules** tab and replace with the content from `storage.rules`

### Step 4: Security Rules Implementation

#### Firestore Rules (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data, admins can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         (resource != null && resource.data.role == 'admin') ||
         (request.resource != null && request.resource.data.role == 'admin'));
      
      // Allow creating new user documents during signup
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection - authenticated users can read, only admins can write
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Cart collection - users can only access their own cart items
    match /cart/{cartId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.resource.data.userId == request.auth.uid);
    }
    
    // Orders collection - users can read their own orders, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
      
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
    }
    
    // Reviews collection - authenticated users can read, users can write their own reviews
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
    }
    
    // Categories collection - authenticated users can read, only admins can write
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Default deny rule for any other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Storage Rules (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images - users can upload/read their own images
    match /users/{userId}/profile/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Product images - authenticated users can read, only admins can upload
    match /products/{productId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
        get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Review images - authenticated users can read, users can upload their own review images
    match /reviews/{reviewId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/(default)/documents/reviews/$(reviewId)) &&
        get(/databases/(default)/documents/reviews/$(reviewId)).data.userId == request.auth.uid;
    }
    
    // General images folder - authenticated users can read, admins can upload
    match /images/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
        get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Default deny rule for any other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 3. Database Structure

### Collections:
- **users**: User profiles and authentication data
- **products**: Product catalog
- **cart**: Shopping cart items
- **orders**: Customer orders
- **reviews**: Product reviews
- **categories**: Product categories

### Document Structure Examples:

#### Users Document:
```javascript
{
  id: "user_uid",
  email: "user@example.com",
  displayName: "User Name",
  role: "user" | "admin",
  phone: "+1234567890",
  address: "123 Main St",
  preferences: {
    favoriteCategories: ["electronics", "clothing"],
    size: "M",
    style: ["casual", "formal"]
  },
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp
}
```

#### Products Document:
```javascript
{
  id: "product_id",
  name: "Product Name",
  brand: "Brand Name",
  category: "electronics" | "clothing" | "home" | "books" | "sports" | "beauty" | "toys" | "automotive",
  price: 99.99,
  originalPrice: 129.99,
  description: "Product description",
  images: ["image_url_1", "image_url_2"],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Red", "Blue", "Green"],
  rating: 4.5,
  reviewCount: 25,
  inStock: true,
  featured: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 4. Testing Firebase Functions

### Test Authentication:
1. Create admin account: `admin@gmail.com` / `admin123`
2. Create regular user account
3. Test login/logout functionality

### Test Firestore Rules:
1. Try to read products as authenticated user (should work)
2. Try to write products as regular user (should fail)
3. Try to write products as admin (should work)
4. Try to access other user's cart (should fail)

### Test Storage Rules:
1. Try to upload product images as regular user (should fail)
2. Try to upload product images as admin (should work)
3. Try to read product images as authenticated user (should work)

## 5. Security Best Practices

1. **Always validate data on the client side** before sending to Firebase
2. **Use server-side validation** for critical operations
3. **Implement rate limiting** for API calls
4. **Monitor Firebase usage** in the console
5. **Regular security audits** of rules and data access

## 6. Troubleshooting

### Common Issues:
1. **Permission denied errors**: Check if user is authenticated and has proper role
2. **Rules not updating**: Wait a few minutes for rules to propagate
3. **Storage upload failures**: Check file size limits and allowed file types
4. **Authentication errors**: Verify email/password and user account status

### Debug Mode:
- Enable debug mode in Firebase console to see rule evaluation details
- Use Firebase emulator for local testing
- Check browser console for detailed error messages

