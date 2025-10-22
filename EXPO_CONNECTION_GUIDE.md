# 🔧 Expo Go Connection Troubleshooting Guide

## 🚨 "This site can't be reached" Error - SOLUTIONS

### ✅ **Solution 1: Use Tunnel Mode (RECOMMENDED)**
```bash
npx expo start --tunnel --clear
```
- Creates a public URL that works from anywhere
- Bypasses local network issues
- Most reliable method

### ✅ **Solution 2: Check Network Connection**
1. **Make sure your phone and computer are on the SAME WiFi network**
2. **Disable mobile data** on your phone temporarily
3. **Try connecting to a different WiFi** if possible

### ✅ **Solution 3: Use Web Version**
```bash
npx expo start --web
```
- Open `http://localhost:8081` in your browser
- Test the app in web browser first

### ✅ **Solution 4: Manual IP Connection**
1. Find your computer's IP address:
   - Windows: `ipconfig`
   - Look for "IPv4 Address" under your WiFi adapter
2. Use the IP in Expo Go app:
   - Open Expo Go
   - Tap "Enter URL manually"
   - Enter: `exp://YOUR_IP:8081`

### ✅ **Solution 5: Reset Everything**
```bash
# Stop all processes
taskkill /f /im node.exe

# Clear cache
npx expo r -c

# Start fresh
npx expo start --tunnel --clear
```

## 📱 **Expo Go App Setup**

### **For Android:**
1. Download "Expo Go" from Google Play Store
2. Open Expo Go app
3. Scan the QR code from terminal
4. If QR doesn't work, tap "Enter URL manually"

### **For iOS:**
1. Download "Expo Go" from App Store
2. Open Camera app
3. Point at QR code
4. Tap the notification to open in Expo Go

## 🔍 **Common Issues & Fixes**

### **Issue: "Metro bundler failed to start"**
**Fix:** 
```bash
npx expo install --fix
npx expo start --clear
```

### **Issue: "Port already in use"**
**Fix:**
```bash
# Kill processes using port 8081
netstat -ano | findstr :8081
taskkill /PID <PID_NUMBER> /F
```

### **Issue: "Network request failed"**
**Fix:**
1. Check firewall settings
2. Try tunnel mode: `npx expo start --tunnel`
3. Use different WiFi network

### **Issue: "App not loading"**
**Fix:**
1. Clear Expo Go app cache
2. Restart Expo Go app
3. Try web version first: `npx expo start --web`

## 🎯 **Quick Test Steps**

1. **Start Expo:** `npx expo start --tunnel --clear`
2. **Wait for QR code** to appear
3. **Open Expo Go** on your phone
4. **Scan QR code** or enter URL manually
5. **Wait for app to load** (may take 1-2 minutes first time)

## 📞 **Still Having Issues?**

Try these in order:
1. **Tunnel mode** (most reliable)
2. **Web version** (test in browser)
3. **Different WiFi network**
4. **Restart everything** (computer, phone, router)
5. **Update Expo Go app**

## 🎉 **Success Indicators**

✅ QR code appears in terminal  
✅ Expo Go connects successfully  
✅ App loads on your phone  
✅ You can see the home page with local images  

---

**Your local images should now be visible in the "Our Product Collection" section! 🖼️**


