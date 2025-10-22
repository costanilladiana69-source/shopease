// Test Admin Account Script
// Run this with: node scripts/testAdmin.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
   apiKey: "AIzaSyD5a3wyNDYee6o1a6vLxMcFYt-Gdw5Kp8Q",
  authDomain: "shopease-cea52.firebaseapp.com",
  projectId: "shopease-cea52",
  storageBucket: "shopease-cea52.firebasestorage.app",
  messagingSenderId: "122932901549",
  appId: "1:122932901549:web:18b35f9a73be677584f824"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testAdminAccount = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    console.log('Testing admin account...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    // Try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = userCredential.user;

    console.log('✅ Admin user signed in successfully!');
    console.log('User ID:', adminUser.uid);
    console.log('Email:', adminUser.email);

    // Check Firestore document
    const userDocRef = doc(db, 'users', adminUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document found in Firestore');
      console.log('User Data:', JSON.stringify(userData, null, 2));
      
      if (userData.role === 'admin') {
        console.log('✅ User has admin role');
      } else {
        console.log('❌ User does NOT have admin role');
        console.log('Current role:', userData.role);
      }
    } else {
      console.log('❌ User document NOT found in Firestore');
    }

    console.log('✅ Admin account test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing admin account:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Admin account does not exist in Firebase Auth');
    } else if (error.code === 'auth/wrong-password') {
      console.log('❌ Admin account exists but password is incorrect');
    } else if (error.code === 'auth/invalid-email') {
      console.log('❌ Invalid email format');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('❌ Invalid credentials - check email and password');
    }
    
    process.exit(1);
  }
};

testAdminAccount();
