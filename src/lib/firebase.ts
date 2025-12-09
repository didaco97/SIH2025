import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is properly set
const isConfigured = firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId;

// Initialize Firebase (prevent re-initialization in development)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isConfigured) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app, "krishisense"); // Using named database 'krishisense'
        storage = getStorage(app);
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
} else {
    console.warn(
        '⚠️ Firebase is not configured. Please set up your .env.local file with Firebase credentials.\n' +
        'Copy .env.example to .env.local and fill in your Firebase config values.\n' +
        'Get these from: Firebase Console > Project Settings > Your Apps > Web App'
    );
}

// Export a flag to check if Firebase is ready
export const isFirebaseConfigured = isConfigured && app !== null;

// Firebase services (may be null if not configured)
export { auth, db, storage };

export default app;
