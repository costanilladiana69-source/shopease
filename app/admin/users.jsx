import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { db } from '../../firebaseConfig.js';
import { COLORS } from '../../constants/colors.js';
import { handleFirestoreError } from '../../utils/firebaseErrorHandler.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have permission to access this page.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  }, [user]);

  // Real-time listener for users
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    console.log('Setting up real-time users listener for admin...');
    setLoading(true);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          console.log('Admin users snapshot received:', querySnapshot.docs.length, 'users');
          const usersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            lastLoginAt: doc.data().lastLoginAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          }));
          
          console.log('Admin users updated in real-time:', usersData.length);
          setUsers(usersData);
        } catch (error) {
          console.error('Error processing admin users snapshot:', error);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      }, 
      (error) => {
        console.error('Error with admin users listener:', error);
        const errorMessage = handleFirestoreError(error, 'Real-time users listener');
        console.log('Admin users listener error:', errorMessage);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => {
      console.log('Cleaning up admin users listener');
      unsubscribe();
    };
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Real-time listeners will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getUserStatusColor = (userData) => {
    if (userData.role === 'admin') return COLORS.primary;
    if (userData.isActive === false) return COLORS.error;
    return COLORS.success;
  };

  const getUserStatusText = (userData) => {
    if (userData.role === 'admin') return 'Admin';
    if (userData.isActive === false) return 'Inactive';
    return 'Active';
  };

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.role === 'user').length}</Text>
          <Text style={styles.statLabel}>Regular Users</Text>
        </View>
      </View>

      {/* Users List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>Users will appear here once they register</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {users.map((userData) => (
              <View key={userData.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.userHeader}>
                    <Text style={styles.userName}>{userData.displayName || 'No Name'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getUserStatusColor(userData) }]}>
                      <Text style={styles.statusText}>{getUserStatusText(userData)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.userEmail}>{userData.email}</Text>
                  
                  <View style={styles.userDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>
                        Joined: {formatDate(userData.createdAt)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>
                        Last Login: {formatDate(userData.lastLoginAt)}
                      </Text>
                    </View>
                    
                    {userData.phone && (
                      <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{userData.phone}</Text>
                      </View>
                    )}
                    
                    {userData.address && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{userData.address}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  usersList: {
    gap: 16,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
