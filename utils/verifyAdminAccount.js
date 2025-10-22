import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

export const verifyAdminAccount = async () => {
  try {
    const auth = getAuth();
    const adminEmail = 'admin@shopease.com';
    const adminPassword = 'admin123';

    console.log('Verifying admin account...');

    // Try to sign in with admin credentials
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = userCredential.user;

    console.log('Admin user signed in successfully:', adminUser.uid);

    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', adminUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User document found:', userData);
      
      if (userData.role === 'admin') {
        console.log('Admin account is properly configured');
        await signOut(auth);
        return { 
          success: true, 
          message: 'Admin account exists and is properly configured',
          userData: userData
        };
      } else {
        console.log('User exists but is not admin');
        await signOut(auth);
        return { 
          success: false, 
          message: 'User exists but does not have admin role',
          userData: userData
        };
      }
    } else {
      console.log('User document not found in Firestore');
      await signOut(auth);
      return { 
        success: false, 
        message: 'User exists in Firebase Auth but not in Firestore'
      };
    }
  } catch (error) {
    console.error('Error verifying admin account:', error);
    
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'Admin account does not exist in Firebase Auth' };
    } else if (error.code === 'auth/wrong-password') {
      return { success: false, message: 'Admin account exists but password is incorrect' };
    } else if (error.code === 'auth/invalid-email') {
      return { success: false, message: 'Invalid email format' };
    } else {
      return { success: false, message: error.message };
    }
  }
};


