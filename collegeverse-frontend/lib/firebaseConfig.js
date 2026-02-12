// Firebase Client SDK Configuration for Frontend
// Values loaded from environment variables with fallback to direct config

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD9qyMjxJRj-Qg5mDX0WyNBVnXvpi_3T9U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "college-verse-77da3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "college-verse-77da3",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "college-verse-77da3.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "339471655626",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:339471655626:web:e58b8683cb2ebcc1098a33",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1G4G0QSYBK",
};

export default firebaseConfig;
