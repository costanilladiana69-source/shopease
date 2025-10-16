# Admin Account Setup Guide

## 🔧 Fixing "Invalid Credentials" Error

If you're getting a Firebase "invalid credentials" error when trying to login as admin, follow these steps:

### Step 1: Create Admin Account

1. **Open the app** and you should see the initialization screen
2. **Click "Create Admin Account"** (green button)
3. **Wait for success message** - this creates the admin account in Firebase

### Step 2: Verify Admin Account

1. **Click "Verify Admin Account"** (orange button) to check if everything is set up correctly
2. **Check the status message** - it should say "Admin account is properly configured"

### Step 3: Login as Admin

1. **Go to login screen**
2. **Enter credentials:**
   - Email: `admin@gmail.com`
   - Password: `admin123`
3. **You should be redirected to the admin dashboard**

## 🛠️ Manual Setup (If App Method Fails)

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Users
4. Click "Add User"
5. Enter:
   - Email: `admin@gmail.com`
   - Password: `admin123`
6. Click "Add User"

### Option 2: Using Test Script
1. Update `scripts/testAdmin.js` with your Firebase config
2. Run: `node scripts/testAdmin.js`
3. This will test if the admin account exists and works

## 🔍 Troubleshooting

### Error: "User not found"
- Admin account doesn't exist in Firebase Auth
- **Solution:** Create admin account using the app or Firebase Console

### Error: "Wrong password"
- Admin account exists but password is incorrect
- **Solution:** Reset password in Firebase Console or create new account

### Error: "Invalid credentials"
- Usually means the account doesn't exist
- **Solution:** Create the admin account first

### Error: "User exists but not admin"
- Account exists but doesn't have admin role
- **Solution:** Use "Create Admin Account" button to update the role

## 📋 Admin Account Details

- **Email:** admin@gmail.com
- **Password:** admin123
- **Role:** admin
- **Access:** Full admin dashboard with product management

## ✅ Verification Checklist

- [ ] Admin account exists in Firebase Authentication
- [ ] Admin account has correct email and password
- [ ] Admin account has "admin" role in Firestore
- [ ] Can login successfully with admin credentials
- [ ] Redirected to admin dashboard after login

## 🚨 Important Notes

1. **First Time Setup:** Always create the admin account before trying to login
2. **Password Security:** The admin password is hardcoded as "admin123" for demo purposes
3. **Role Assignment:** The admin role is automatically assigned when creating the account
4. **Firestore Document:** Admin user document is created in the "users" collection

## 📞 Need Help?

If you're still having issues:
1. Check the console logs for detailed error messages
2. Verify your Firebase configuration is correct
3. Make sure Firebase Authentication is enabled
4. Ensure Firestore database is set up properly
