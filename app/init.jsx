import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig.js';
import { createAdminAccount } from '../utils/createAdminAccount.js';
import { seedDatabase } from '../utils/seedData.js';
import { verifyAdminAccount } from '../utils/verifyAdminAccount.js';
import { COLORS } from '../constants/colors.js';

export default function InitScreen() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      if (querySnapshot.empty) {
        setLoading(false);
      } else {
        // Database has data, redirect to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking database:', error);
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      // Create admin account first
      const adminResult = await createAdminAccount();
      console.log('Admin creation result:', adminResult);
      
      // Then seed the database
      await seedDatabase();
      Alert.alert('Success', 'Database seeded successfully! Admin account created.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (error) {
      console.error('Error seeding database:', error);
      Alert.alert('Error', 'Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  const skipSeeding = () => {
    router.replace('/login');
  };

  const handleCreateAdmin = async () => {
    setSeeding(true);
    try {
      const adminResult = await createAdminAccount();
      if (adminResult.success) {
        Alert.alert('Success', 'Admin account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Error', adminResult.message);
      }
    } catch (error) {
      console.error('Error creating admin account:', error);
      Alert.alert('Error', 'Failed to create admin account');
    } finally {
      setSeeding(false);
    }
  };

  const handleVerifyAdmin = async () => {
    setSeeding(true);
    try {
      const verifyResult = await verifyAdminAccount();
      if (verifyResult.success) {
        Alert.alert('Success', 'Admin account is properly configured and ready to use!', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Admin Account Status', verifyResult.message, [
          { text: 'OK' }
        ]);
      }
    } catch (error) {
      console.error('Error verifying admin account:', error);
      Alert.alert('Error', 'Failed to verify admin account');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ShopEase</Text>
        <Text style={styles.subtitle}>Your simple e-commerce marketplace</Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Welcome to ShopEase! This appears to be your first time using the app.
          </Text>
          <Text style={styles.message}>
            Would you like to populate the database with sample product data?
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleSeedDatabase}
            disabled={seeding}
          >
            <Text style={styles.primaryButtonText}>
              {seeding ? 'Seeding Database...' : 'Yes, Add Sample Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.adminButton]} 
            onPress={handleCreateAdmin}
            disabled={seeding}
          >
            <Text style={styles.adminButtonText}>
              {seeding ? 'Creating Admin...' : 'Create Admin Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.verifyButton]} 
            onPress={handleVerifyAdmin}
            disabled={seeding}
          >
            <Text style={styles.verifyButtonText}>
              {seeding ? 'Verifying...' : 'Verify Admin Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={skipSeeding}
            disabled={seeding}
          >
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: COLORS.WARNING,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

