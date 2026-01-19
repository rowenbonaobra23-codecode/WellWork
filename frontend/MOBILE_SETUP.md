# WellWork Mobile App Setup Guide

This guide will help you convert the WellWork web app into a native mobile app for Android and iOS using Capacitor.

## Prerequisites

### For Android Development:
- **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
- **Java JDK 11+** - Usually comes with Android Studio
- **Android SDK** - Installed via Android Studio

### For iOS Development (Mac only):
- **Xcode** - Download from Mac App Store
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`

## Step 1: Build the Web App

First, build your React app for production:

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist` folder.

## Step 2: Add Mobile Platforms

### Add Android Platform:

```bash
npm run cap:add android
```

### Add iOS Platform (Mac only):

```bash
npm run cap:add ios
```

## Step 3: Configure API URL for Mobile

**Important:** Mobile apps can't use `localhost` to connect to your backend. You need to use your computer's IP address.

1. Find your computer's IP address:
   - **Windows**: Open Command Prompt and run `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Run `ifconfig` or `ip addr`, look for your local network IP

2. Update `frontend/src/mobileConfig.js`:
   ```javascript
   return import.meta.env.VITE_API_URL || 'http://YOUR_IP_ADDRESS:5000'
   ```
   Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `192.168.1.100`)

3. Or set environment variable:
   ```bash
   # Create .env file in frontend folder
   VITE_API_URL=http://192.168.1.100:5000
   ```

## Step 4: Sync Capacitor

After making changes, sync them to mobile platforms:

```bash
npm run cap:sync
```

This copies your web app build and updates native projects.

## Step 5: Open in Native IDE

### For Android:

```bash
npm run cap:android
```

This will:
1. Build your web app
2. Sync to Android
3. Open Android Studio

In Android Studio:
- Wait for Gradle sync to complete
- Click the "Run" button (green play icon) or press `Shift+F10`
- Select an emulator or connected device
- Your app will launch!

### For iOS (Mac only):

```bash
npm run cap:ios
```

This will:
1. Build your web app
2. Sync to iOS
3. Open Xcode

In Xcode:
- Select a simulator or connected device
- Click the "Run" button (play icon) or press `Cmd+R`
- Your app will launch!

## Step 6: Running Your Backend for Mobile

Make sure your backend is accessible from your mobile device/emulator:

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Allow firewall access** (if needed):
   - Windows: Allow Node.js through Windows Firewall
   - Mac/Linux: May need to configure firewall rules

3. **Test connectivity:**
   - From your mobile device/emulator, try accessing: `http://YOUR_IP:5000/health`
   - Should return: `{"status":"ok","time":"..."}`

## Development Workflow

### Making Changes:

1. **Update your React code** in `frontend/src/`
2. **Rebuild:** `npm run build`
3. **Sync:** `npm run cap:sync`
4. **Reload in app:** Shake device/emulator → "Reload" (or restart app)

### Quick Commands:

```bash
# Build and sync Android
npm run cap:android

# Build and sync iOS
npm run cap:ios

# Just sync (after manual build)
npm run cap:sync

# Open native IDE
npm run cap:open
```

## Troubleshooting

### "Cannot connect to backend" on mobile:
- ✅ Check your IP address is correct in `mobileConfig.js`
- ✅ Ensure backend is running
- ✅ Ensure mobile device/emulator is on same network
- ✅ Check firewall isn't blocking port 5000
- ✅ Try accessing backend URL in mobile browser first

### Build errors:
- ✅ Run `npm install` in frontend folder
- ✅ Clear build cache: Delete `dist` folder and rebuild
- ✅ Check Node.js version (18+ required)

### Android Studio issues:
- ✅ Update Android Studio to latest version
- ✅ Install Android SDK Platform 33+
- ✅ Accept all Android licenses: `sdkmanager --licenses`

### iOS build issues:
- ✅ Update Xcode to latest version
- ✅ Run `pod install` in `ios/App` folder
- ✅ Check signing certificates in Xcode

## Building for Production

### Android APK:

1. Open Android Studio
2. Build → Generate Signed Bundle / APK
3. Follow the wizard to create your APK

### iOS App Store:

1. Open Xcode
2. Product → Archive
3. Follow App Store Connect process

## Features Available in Mobile

Your app will have access to:
- ✅ Native notifications (better than browser notifications)
- ✅ Haptic feedback
- ✅ Status bar styling
- ✅ Keyboard handling
- ✅ App lifecycle events
- ✅ Offline storage (already implemented)

## Next Steps

- Add app icons and splash screens
- Configure app permissions (notifications, etc.)
- Set up app signing for distribution
- Test on real devices
- Publish to Google Play Store / Apple App Store

For more information, visit: [capacitorjs.com/docs](https://capacitorjs.com/docs)



