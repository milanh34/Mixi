import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase config
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Check your .env file and app.config.js');
}

// Import getReactNativePersistence dynamically
let getReactNativePersistence: any;
try {
  // Try official path first
  getReactNativePersistence = require('firebase/auth/react-native').getReactNativePersistence;
} catch (e) {
  try {
    // Fallback to internal path
    getReactNativePersistence = require('@firebase/auth/dist/rn/index.js').getReactNativePersistence;
  } catch (e2) {
    console.warn('Could not load getReactNativePersistence, using default persistence');
  }
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize auth with AsyncStorage persistence if available
  if (getReactNativePersistence) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    console.log('✅ Firebase initialized with AsyncStorage persistence');
  } else {
    auth = getAuth(app);
    console.log('⚠️ Firebase initialized with default persistence');
  }
  
  db = getFirestore(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
