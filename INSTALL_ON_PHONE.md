# 📱 How to Install WellWork App on Your Phone

## Quick Installation Guide

Your app is now ready to be built and installed on your Android phone! Here are **3 simple methods**:

---

## 🎯 Method 1: Build APK with Android Studio (Recommended)

### Step 1: Install Android Studio
1. Download Android Studio from: https://developer.android.com/studio
2. Install it (this may take 10-20 minutes)
3. Open Android Studio and let it complete setup

### Step 2: Open Your Project
1. Open Android Studio
2. Click "Open" and navigate to: `C:\Users\admin\Documents\WorkWell\frontend\android`
3. Wait for Gradle sync to complete (first time may take a few minutes)

### Step 3: Build APK
1. In Android Studio, go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for the build to complete (2-5 minutes)
3. When done, click "locate" in the notification, or find the APK at:
   ```
   frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Step 4: Install on Your Phone
1. Copy the `app-debug.apk` file to your phone (via USB, email, or cloud storage)
2. On your phone, enable "Install from Unknown Sources" in Settings → Security
3. Open the APK file on your phone and tap "Install"
4. Done! 🎉

---

## 🚀 Method 2: Build APK from Command Line (Faster)

### Prerequisites:
- Android Studio installed (for Android SDK)
- Add Android SDK to your PATH, or use Android Studio's terminal

### Build APK:
```powershell
cd frontend\android
.\gradlew assembleDebug
```

The APK will be at: `frontend\android\app\build\outputs\apk\debug\app-debug.apk`

Then copy it to your phone and install!

---

## 📲 Method 3: Install Directly via USB (Easiest for Testing)

### Step 1: Enable USB Debugging on Your Phone
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times to enable Developer Options
3. Go back to Settings → Developer Options
4. Enable "USB Debugging"

### Step 2: Connect Phone and Install
1. Connect your phone to your computer via USB
2. Open Android Studio
3. Open the project: `frontend\android`
4. Click the green "Run" button (▶️)
5. Select your phone from the device list
6. The app will install and launch automatically!

---

## ⚙️ Important: Backend Server Setup

**Before using the app, make sure your backend is running:**

1. Open a terminal in the `backend` folder
2. Run: `npm start`
3. Make sure your phone and computer are on the **same Wi-Fi network**
4. The app is configured to connect to: `http://192.168.100.185:5000`

**If your IP address changes**, update it in:
- `frontend\src\mobileConfig.js` (line 46)

---

## 🔄 Updating the App

When you make changes to your app:

1. **Rebuild the web app:**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Sync to Android:**
   ```powershell
   npx cap sync
   ```

3. **Rebuild APK** (using Method 1 or 2 above)

---

## ❓ Troubleshooting

### "App won't connect to backend"
- ✅ Make sure backend is running (`npm start` in backend folder)
- ✅ Check phone and computer are on same Wi-Fi
- ✅ Verify IP address in `mobileConfig.js` matches your computer's IP
- ✅ Check Windows Firewall isn't blocking port 5000

### "Can't install APK"
- ✅ Enable "Install from Unknown Sources" in phone settings
- ✅ Make sure you downloaded the APK completely

### "Build fails in Android Studio"
- ✅ Make sure Android SDK Platform 33+ is installed
- ✅ Accept Android licenses: `sdkmanager --licenses`
- ✅ Update Android Studio to latest version

---

## 📝 Next Steps

- Test the app on your phone
- Make sure backend is accessible from your phone's network
- Consider building a signed APK for distribution
- Add app icon and splash screen customization

**Your app is ready! Choose the method that works best for you.** 🎉

