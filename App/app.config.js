// app.config.js
require('dotenv').config();

module.exports = {
  expo: {
    name: "Mixi",
    slug: "Mixi",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mixi",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.mixi"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.yourcompany.mixi"
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-barcode-scanner",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    // Environment variables exposed to app
    extra: {
      // Firebase
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      
      // Cloudinary
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    }
  }
};
