// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- IMPORTANT ---
// --- ACTION REQUIRED ---
// Replace the placeholder values below with your actual Firebase project configuration.
// You can find these values in your Firebase project settings.
// Go to: Project Settings > General > Your apps > Select your web app > SDK setup and configuration > Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // Replace with your API Key
  authDomain: "YOUR_AUTH_DOMAIN_HERE", // e.g., your-project-id.firebaseapp.com
  projectId: "YOUR_PROJECT_ID_HERE", // Replace with your Project ID
  storageBucket: "YOUR_STORAGE_BUCKET_HERE", // e.g., your-project-id.appspot.com
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE", // e.g., 1:xxxxxxxx:web:xxxxxxxx
  measurementId: "YOUR_MEASUREMENT_ID_HERE" // e.g., G-XXXXXXXXXX
};

// Check if all placeholder values have been replaced
if (firebaseConfig.apiKey.includes("YOUR_") || firebaseConfig.projectId.includes("YOUR_")) {
    console.error(
        "CRITICAL ERROR: Firebase configuration in src/lib/firebase.ts still contains placeholder values. " +
        "Please replace them with your actual Firebase project credentials."
    );
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // To avoid re-initializing on hot reloads in dev, check if an app is already initialized.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Error initializing Firebase. Please check your configuration in src/lib/firebase.ts", e);
  // Re-throw the error to ensure it's visible that initialization failed
  throw e;
}


export { app, auth, db };