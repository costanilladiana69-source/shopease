// Quick Admin Account Creation Script
// Run this with: node create-admin-now.js

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: "gelcastore.firebaseapp.com",
  projectId: "gelcastore",
  storageBucket: "gelcastore.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAdminNow = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    console.log('🚀 Creating admin account...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = userCredential.user;

    console.log('✅ Admin user created in Firebase Auth!');
    console.log('User ID:', adminUser.uid);

    // Create admin user document in Firestore
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

    await setDoc(doc(db, 'users', adminUser.uid), adminUserData);
    
    console.log('✅ Admin user document created in Firestore!');
    console.log('🎉 Admin account setup completed successfully!');
    console.log('');
    console.log('You can now login with:');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    
    // Sign out
    await signOut(auth);
    console.log('✅ Signed out successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin account already exists!');
      console.log('You can try logging in with:');
      console.log('Email: admin@gmail.com');
      console.log('Password: admin123');
    } else if (error.code === 'auth/invalid-email') {
      console.log('❌ Invalid email format');
    } else if (error.code === 'auth/weak-password') {
      console.log('❌ Password is too weak');
    }
    
    process.exit(1);
  }
};

createAdminNow();
