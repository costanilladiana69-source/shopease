import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from "../firebase";

import {
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

// Create context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Sign in function
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user document
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const mergedUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: userData.displayName || firebaseUser.displayName || 'User',
          photoURL: userData.photoURL || firebaseUser.photoURL || '',
          role: userData.role || 'user',
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };

        setUser(mergedUser);
        await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
      } else {
        // Create a new user document
        const newUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newUser);
        setUser({ ...newUser, createdAt: new Date(), updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Error during signIn:', error);
      throw error;
    }
  };

  // ✅ Sign out function
  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ✅ Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Re-fetch user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...userDocSnap.data() });
        } else {
          setUser(firebaseUser);
        }
      } catch (err) {
        console.error('Error fetching user on auth change:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ✅ Provide context values
  return (
    <AuthContext.Provider value={{ user, setUser, signIn, signOutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for easy use
export const useAuth = () => useContext(AuthContext);
