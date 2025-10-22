import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { db } from '../../firebaseConfig.js';
import { COLORS } from '../../constants/colors.js';
// removed unused handleFirestoreError import

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have permission to access the admin dashboard.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  }, [user]);

  // Real-time listeners for dashboard statistics
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    console.log('Setting up real-time dashboard listeners for admin...');
    setLoading(true);

    // Listen to products collection
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      console.log('Products count updated:', snapshot.size);
      setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
    });

    // Listen to users collection
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      console.log('Users count updated:', snapshot.size);
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Listen to orders collection
    const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      console.log('Orders count updated:', snapshot.size);
      let totalRevenue = 0;
      snapshot.forEach(doc => {
        const orderData = doc.data();
        totalRevenue += orderData.total || 0;
      });
      console.log('Total revenue updated:', totalRevenue);
      setStats(prev => ({ 
        ...prev, 
        totalOrders: snapshot.size,
        totalRevenue 
      }));
    });

    // Set loading to false after initial load
    setTimeout(() => setLoading(false), 1000);

    return () => {
      console.log('Cleaning up dashboard listeners');
      productsUnsubscribe();
      usersUnsubscribe();
      ordersUnsubscribe();
    };
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  // Show loading or redirect non-admin users
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.displayName || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
              <View style={styles.statHeader}>
                <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statTitle}>Total Products</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.secondary }]}>
              <View style={styles.statHeader}>
                <Ionicons name="people-outline" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statTitle}>Total Users</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
              <View style={styles.statHeader}>
                <Ionicons name="receipt-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statTitle}>Total Orders</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
              <View style={styles.statHeader}>
                <Ionicons name="cash-outline" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>₱{stats.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statTitle}>Total Revenue</Text>
            </View>
          </View>
        </View>

        {/* Admin Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Admin Management</Text>
          <View style={styles.menuList}>
            <TouchableOpacity 
              style={[styles.menuButton, { borderLeftColor: COLORS.primary }]}
              onPress={() => router.push('/admin/products')}
            >
              <View style={styles.menuButtonContent}>
                <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
                <Text style={styles.menuButtonText}>Manage Products</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.grayMedium} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuButton, { borderLeftColor: COLORS.secondary }]}
              onPress={() => router.push('/admin/users')}
            >
              <View style={styles.menuButtonContent}>
                <Ionicons name="people-outline" size={24} color={COLORS.secondary} />
                <Text style={styles.menuButtonText}>Manage Users</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.grayMedium} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuButton, { borderLeftColor: COLORS.success }]}
              onPress={() => router.push('/admin/orders')}
            >
              <View style={styles.menuButtonContent}>
                <Ionicons name="receipt-outline" size={24} color={COLORS.success} />
                <Text style={styles.menuButtonText}>View Orders</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.grayMedium} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuButton, { borderLeftColor: COLORS.warning }]}
              onPress={() => router.push('/admin/analytics')}
            >
              <View style={styles.menuButtonContent}>
                <Ionicons name="analytics-outline" size={24} color={COLORS.warning} />
                <Text style={styles.menuButtonText}>Analytics</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.grayMedium} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => router.push('/admin/products')}
            >
              <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(tabs)')}>
              <Ionicons name="storefront-outline" size={32} color={COLORS.secondary} />
              <Text style={styles.quickActionText}>View Store</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  menuContainer: {
    marginBottom: 32,
  },
  menuList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 16,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
});

