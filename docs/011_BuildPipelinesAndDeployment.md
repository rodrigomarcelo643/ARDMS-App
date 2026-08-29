# 011 — Build Pipelines & Deployment Guide

## 🚀 Build Pipeline Architecture
MedSIS Mobile utilizes **Expo Application Services (EAS)** and local React Native toolchains to build standalone **Android (APK / AAB)** and **iOS (IPA)** binaries.

---

## 📦 Build Commands & Pipelines

### 1. Local Development Server
Start Metro bundler with interactive Expo CLI:
```bash
npm start
# or: npx expo start --clear
```

### 2. Android Prebuild & Local Compilation
Generate native Android Gradle workspace and run on a connected USB device or emulator:
```bash
# Clean prebuild
npm run prebuild:android

# Compile and launch on connected Android device
npm run android
```

### 3. Cloud EAS Build (Production / Preview APK)
To trigger automated cloud builds via Expo EAS:
```bash
# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure

# Build standalone Android APK (preview / internal distribution)
eas build --platform android --profile preview

# Build production Android App Bundle (Google Play Store AAB)
eas build --platform android --profile production
```

---

## ⚙️ Configuration Files

### `eas.json` Profile Configuration:
```json
{
  "cli": {
    "version": ">= 14.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### `app.json` Android App Settings:
- **Package Name**: `com.medsis.student`
- **Version**: `1.0.0`
- **Permissions**: `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `NOTIFICATIONS`, `VIBRATE`.
- **Adaptive Icon**: Maroon background with white MedSIS emblem (`#af1616`).

---

## 📋 Production Release Checklist
1. Ensure all console log statements and sensitive debug tokens are disabled.
2. Confirm `API_BASE_URL` in `constants/Config.ts` points to the production server (`https://swu-som.com`).
3. Verify Android Keystore certificates in EAS credentials manager.
4. Test APK installation on physical Android 11, 12, 13, and 14 devices.
