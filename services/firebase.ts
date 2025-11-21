import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAV-V7INm_sHhnnxU8kT2UyTMDOk0ZeA0g",
  authDomain: "krishiuday-a256b.firebaseapp.com",
  projectId: "krishiuday-a256b",
  storageBucket: "krishiuday-a256b.firebasestorage.app",
  messagingSenderId: "186147515734",
  appId: "1:186147515734:web:f6782dd3e500795f8bbaf7",
  measurementId: "G-DLJCB1ZWEM"
};

// Initialize Firebase
// We use getApps() to check if an app is already initialized to prevent 
// "Firebase App named '[DEFAULT]' already exists" errors during hot reloading.
let app;
let auth;
let initializationError;

try {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
} catch (error: any) {
    console.error("Firebase initialization error:", error);
    initializationError = error;
}

export { auth, initializationError };