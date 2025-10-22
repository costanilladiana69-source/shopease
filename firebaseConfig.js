// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Correct Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5a3wyNDYee6o1a6vLxMcFYt-Gdw5Kp8Q",
  authDomain: "shopease-cea52.firebaseapp.com",
  projectId: "shopease-cea52",
  storageBucket: "shopease-cea52.firebasestorage.app",
  messagingSenderId: "122932901549",
  appId: "1:122932901549:web:18b35f9a73be677584f824"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
