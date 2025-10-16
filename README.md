# 🛍️ ShopEase - Simple E-Commerce Platform

**Proponent:** Diana C. Costanilla  
**Version:** 1.0.0

A beginner-friendly e-commerce platform built with React Native and Expo, featuring a beautiful orange and white design theme.

## 🚀 Quick Start

### Option 1: PowerShell (Recommended)
```powershell
# Navigate to the project directory
cd C:\Users\Gwapo\Downloads\shopease\shopease

# Run the PowerShell startup script
.\start.ps1
```

### Option 2: Batch File
```cmd
# Navigate to the project directory
cd C:\Users\Gwapo\Downloads\shopease\shopease

# Run the batch file
start.bat
```

### Option 3: Manual Commands
```powershell
# Install dependencies (first time only)
npm install

# Start the development server
npx expo start --port 8082
```

## 📱 Accessing Your App

Once the development server starts:

1. **Mobile Device:**
   - Install "Expo Go" from App Store/Google Play
   - Scan the QR code displayed in the terminal

2. **Web Browser:**
   - Press `w` in the terminal to open in browser

3. **Emulator/Simulator:**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 🎨 Features

- ✅ **Product browsing** with orange and white theme
- ✅ **Shopping cart** with real-time updates
- ✅ **User authentication** (login/signup)
- ✅ **Order management** and history
- ✅ **Admin dashboard** for inventory management
- ✅ **Firebase integration** for data storage
- ✅ **Responsive design** for all devices

## 🛠️ Technology Stack

- **Frontend:** React Native with Expo
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Navigation:** Expo Router
- **State Management:** React Context API
- **Language:** JavaScript (converted from TypeScript)

## 🔧 Admin Access

**Admin Credentials:**
- Email: `admin@gmail.com`
- Password: `admin123`

*Note: If this is your first time, create the admin account from the initialization screen.*

## 🎨 Color Scheme

The app features a beautiful orange and white color palette:
- **Primary Orange:** #FF6B35
- **Secondary Orange:** #FF8C42
- **White Backgrounds:** #FFFFFF, #F8F9FA
- **Text Colors:** Various grays for optimal readability

## 📁 Project Structure

```
shopease/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   ├── login.jsx          # Login screen
│   └── _layout.jsx        # Root layout
├── components/            # Reusable components
├── contexts/              # React Context providers
├── constants/             # App constants and colors
├── utils/                 # Utility functions
├── firebaseConfig.js      # Firebase configuration
└── start.ps1             # PowerShell startup script
```

## 🚨 Troubleshooting

### PowerShell Execution Policy
If you get an execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
If port 8082 is busy, the script will automatically try alternative ports.

### Node.js Not Found
Make sure Node.js is installed and added to your system PATH:
- Download from: https://nodejs.org/
- Restart your terminal after installation

## 🎯 Development Commands

```powershell
# Install dependencies
npm install

# Start development server
npm start

# Start with specific port
npx expo start --port 8082

# Clear cache and start
npx expo start --clear

# Build for production
npx expo build
```

## 📞 Support

For issues or questions, please check:
1. Ensure all dependencies are installed
2. Verify Node.js and npm are properly installed
3. Check that the project is in the correct directory
4. Try clearing the cache with `npx expo start --clear`

---

**Happy Shopping with ShopEase! 🛍️**