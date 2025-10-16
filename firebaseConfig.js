// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwTawYwGD19WsOzjG2zt8E-KlmhIV6O7s",
  authDomain: "gelcastore.firebaseapp.com",
  projectId: "gelcastore",
  storageBucket: "gelcastore.appspot.com",
  messagingSenderId: "556257405254",
  appId: "1:556257405254:web:c19f2dacba14241a251d47",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Firestore & Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };


