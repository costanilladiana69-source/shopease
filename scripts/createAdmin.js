// Admin Account Creation Script
// Run this with: node scripts/createAdmin.js

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAdminAccount = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    console.log('Creating admin account...');
    
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = userCredential.user;

    console.log('Admin user created in Firebase Auth:', adminUser.uid);

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
    
    console.log('Admin account created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('You can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error.message);
    process.exit(1);
  }
};

createAdminAccount();
