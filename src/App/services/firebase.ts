import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  appId: import.meta.env.VITE_APP_ID,
  apiKey: import.meta.env.VITE_API_KEY,
  projectId: import.meta.env.VITE_PROJECT_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  authDomain: `${import.meta.env.VITE_PROJECT_ID}.firebaseapp.com`,
  storageBucket: `${import.meta.env.VITE_PROJECT_ID}.appspot.com`,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

export { db, auth, storage, analytics };
