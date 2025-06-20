// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- DIAGNOSTIC LOGS ---
// These logs will appear in your SERVER terminal, not the browser console.
console.log("Firebase Lib: Reading NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "Missing or Undefined");
console.log("Firebase Lib: Reading NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Loaded" : "Missing or Undefined");
// --- END DIAGNOSTIC LOGS ---

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log("Firebase Lib: Assembled firebaseConfig object:", firebaseConfig);


// Conditionally initialize Firebase and export config status.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
export let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
  } catch (e) {
    console.error("Error initializing Firebase:", e)
  }
} else {
  console.error(
    "CRITICAL ERROR: Firebase apiKey or projectId is missing or empty in the assembled firebaseConfig. " +
    "This means the corresponding NEXT_PUBLIC_ environment variables were not correctly loaded. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are correctly set in your .env file (at the project root) and that you have RESTARTED your Next.js development server."
  );
}


export { app, auth, db };