import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        try {
          console.log('Fetching user data from Firestore for UID:', firebaseUser.uid);
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            console.log('User document found in Firestore');
            const userData = userDoc.data();
            const user = {
              id: userData.id,
              email: userData.email,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              phone: userData.phone || '',
              address: userData.address || '',
              bio: userData.bio || '',
              preferences: userData.preferences,
              role: (userData.role === 'admin' ? 'admin' : 'user'),
              isActive: userData.isActive ?? true,
              lastLoginAt: new Date(),
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate()
            };
            console.log('Setting user:', user);
            setUser(user);
            // Update last login time in Firestore
            await updateDoc(doc(db, 'users', firebaseUser.uid), { lastLoginAt: serverTimestamp() });
          } else {
            console.log('User document not found, creating new one');
            // Create new user document
            const isAdmin = false; // No hardcoded admin emails
            const newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || (isAdmin ? 'Admin' : 'User'),
              ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
              phone: '',
              address: '',
              bio: '',
              preferences: {
                favoriteCategories: [],
                size: '',
                style: []
              },
              role: isAdmin ? 'admin' : 'user',
              isActive: true,
              lastLoginAt: serverTimestamp(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            const user = {
              ...newUser,
              lastLoginAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
            console.log('Created and setting new user:', user);
            setUser(user);
          }
            } catch (error) {
              console.error('Error handling auth state change:', error);
              // Fallback: create a basic user object
              const isAdmin = false; // No hardcoded admin emails
              const fallbackUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || (isAdmin ? 'Admin' : 'User'),
                ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
                phone: '',
                address: '',
                bio: '',
                preferences: {
                  favoriteCategories: [],
                  size: '',
                  style: []
                },
                role: isAdmin ? 'admin' : 'user',
                isActive: true,
                lastLoginAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              };
              console.log('Using fallback user:', fallbackUser);
              setUser(fallbackUser);
            }
      } else {
        console.log('No user, setting user to null');
        setUser(null);
      }
      console.log('Setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);


  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

      const signUp = async (email, password, displayName) => {
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
           const isAdmin = false; // No hardcoded admin emails
          const newUser = {
            id: result.user.uid,
            email: result.user.email,
            displayName: isAdmin ? 'Admin' : displayName,
            ...(result.user.photoURL && { photoURL: result.user.photoURL }),
            phone: '',
            address: '',
            bio: '',
            preferences: {
              favoriteCategories: [],
              size: '',
              style: []
            },
            role: isAdmin ? 'admin' : 'user',
            isActive: true,
            lastLoginAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(doc(db, 'users', result.user.uid), newUser);
        } catch (error) {
          throw error;
        }
      };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

