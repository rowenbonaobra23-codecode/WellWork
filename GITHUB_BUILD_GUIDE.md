# 🚀 Build APK Using GitHub Actions - Step by Step Guide

This is the **easiest method** to build your APK without installing Android Studio!

---

## 📋 Prerequisites

- A GitHub account (free)
- Your code ready to push

---

## 🎯 Step-by-Step Instructions

### Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it (e.g., `WorkWell`)
4. Choose **Public** or **Private**
5. **Don't** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

Open PowerShell in your project folder (`C:\Users\admin\Documents\WorkWell`) and run:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for APK build"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

### Step 3: Trigger the Build

1. Go to your GitHub repository page
2. Click the **"Actions"** tab (at the top)
3. You should see **"Build Android APK"** workflow
4. Click **"Run workflow"** button (on the right)
5. Select branch: **main**
6. Click **"Run workflow"** (green button)

### Step 4: Wait for Build

1. The workflow will start running (you'll see it in yellow/orange)
2. Click on the running workflow to see progress
3. Wait **5-10 minutes** for the build to complete
4. You'll see green checkmarks when done ✅

### Step 5: Download Your APK

1. After build completes, scroll down to **"Artifacts"** section
2. Click **"app-debug.apk"**
3. The APK will download to your computer
4. Done! 🎉

---

## 📱 Install APK on Your Phone

### Method A: Email/Cloud Storage

1. Email the APK to yourself, or upload to Google Drive/Dropbox
2. Open the email/drive on your phone
3. Download the APK
4. Tap to install (enable "Install from Unknown Sources" if prompted)

### Method B: USB Transfer

1. Connect phone to computer via USB
2. Copy `app-debug.apk` to your phone
3. Open file manager on phone
4. Find and tap the APK
5. Install!

### Method C: Direct Download

1. Upload APK to a file sharing service
2. Open link on your phone
3. Download and install

---

## 🔄 Updating Your App

When you make changes:

1. **Make your changes** in the code
2. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Updated app"
   git push
   ```
3. **Go to GitHub Actions** → **Run workflow** again
4. **Download new APK** and install on phone

---

## ⚙️ Important Notes

### Backend Server

Before using the app on your phone:

1. **Start your backend:**
   ```powershell
   cd backend
   npm start
   ```

2. **Make sure phone and computer are on same Wi-Fi**

3. **Update IP address** if needed:
   - Find your IP: `ipconfig` (look for IPv4 Address)
   - Update `frontend/src/mobileConfig.js` line 46
   - Push changes and rebuild

### Current IP Configuration

Your app is configured to connect to: `http://192.168.100.185:5000`

If your IP changes, update it in `mobileConfig.js` and rebuild.

---

## ❓ Troubleshooting

### "Workflow not showing in Actions tab"
- ✅ Make sure you pushed the `.github/workflows/build-apk.yml` file
- ✅ Check you're on the correct branch (main/master)

### "Build fails"
- ✅ Check the Actions log for error messages
- ✅ Make sure all dependencies are in `package.json`
- ✅ Verify Node.js version is 18+

### "Can't download APK"
- ✅ Artifacts expire after 30 days
- ✅ Rebuild to get a fresh APK

### "App won't connect to backend"
- ✅ Backend must be running on your computer
- ✅ Phone and computer must be on same Wi-Fi
- ✅ Check IP address in `mobileConfig.js`

---

## 🎉 That's It!

You now have a way to build APKs without Android Studio!

**Next time:** Just push changes → Run workflow → Download APK → Install!

---

## 💡 Pro Tip

You can automate this! The workflow runs automatically when you push to main branch, so you can just:
1. Make changes
2. `git push`
3. Wait for build
4. Download APK

No need to manually trigger each time!

