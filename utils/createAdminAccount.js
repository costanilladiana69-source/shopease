import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

export const createAdminAccount = async () => {
  try {
    const auth = getAuth();
    const adminEmail = 'admin@shopease.com';
    const adminPassword = 'admin123';

    console.log('Attempting to create admin account...');

    let adminUser;
    let isNewUser = false;

    try {
      // Try to create admin user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      adminUser = userCredential.user;
      isNewUser = true;
      console.log('Admin user created in Firebase Auth:', adminUser.uid);
    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('Admin account already exists in Firebase Auth, signing in...');
        // User already exists, try to sign in
        const signInCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        adminUser = signInCredential.user;
        console.log('Successfully signed in existing admin user:', adminUser.uid);
      } else {
        throw createError;
      }
    }

    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', adminUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User document exists, check if it has admin role
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        console.log('Admin account already properly configured');
        await signOut(auth); // Sign out after checking
        return { success: true, message: 'Admin account already exists and is properly configured' };
      } else {
        // Update existing user to admin role
        await updateDoc(userDocRef, {
          role: 'admin',
          displayName: 'Admin',
          updatedAt: serverTimestamp()
        });
        console.log('Updated existing user to admin role');
        await signOut(auth); // Sign out after updating
        return { success: true, message: 'Existing user updated to admin role' };
      }
    } else {
      // Create new admin user document in Firestore
      const adminUserData = {
        id: adminUser.uid,
        email: adminUser.email,
        displayName: 'Admin',
        preferences: {
          favoriteCategories: [],
          size: '',
          style: []
        },
        role: 'admin',
        createdAt: serverTimestamp()
      };

      await setDoc(userDocRef, adminUserData);
      console.log('Admin user document created in Firestore');
    }

    // Sign out after creating/updating
    await signOut(auth);
    
    console.log('Admin account setup completed successfully');
    return { success: true, message: 'Admin account created/updated successfully' };
  } catch (error) {
    console.error('Error creating admin account:', error);
    return { success: false, message: error.message };
  }
};

