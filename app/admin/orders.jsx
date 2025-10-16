import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
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
import { retryFirebaseOperation } from '../../utils/firebaseErrorHandler.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
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

  // Real-time listener for orders
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    console.log('Setting up real-time orders listener for admin...');
    setLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          console.log('Admin orders snapshot received:', querySnapshot.docs.length, 'orders');
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate(),
          }));
          
          console.log('Admin orders updated in real-time:', ordersData.length);
          setOrders(ordersData);
        } catch (error) {
          console.error('Error processing admin orders snapshot:', error);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      }, 
      (error) => {
        console.error('Error with admin orders listener:', error);
        const errorMessage = `Real-time orders listener error: ${error.message}`;
        console.log('Admin orders listener error:', errorMessage);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => {
      console.log('Cleaning up admin orders listener');
      unsubscribe();
    };
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Real-time listeners will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.WARNING;
      case 'confirmed': return COLORS.INFO;
      case 'shipped': return COLORS.PRIMARY;
      case 'delivered': return COLORS.SUCCESS;
      case 'cancelled': return COLORS.ERROR;
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await retryFirebaseOperation(async () => {
        await updateDoc(doc(db, 'orders', orderId), {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      // Real-time listener will automatically update the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', `Failed to update order status: ${error.message}`);
    }
  };

  const showStatusUpdateDialog = (order) => {
    const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const currentStatus = order.status;
    
    Alert.alert(
      'Update Order Status',
      `Current status: ${currentStatus.toUpperCase()}\n\nSelect new status:`,
      statusOptions.map(status => ({
        text: status.toUpperCase(),
        onPress: () => {
          if (status !== currentStatus) {
            updateOrderStatus(order.id, status);
          }
        },
        style: status === currentStatus ? 'cancel' : 'default'
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
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
        <Text style={styles.loadingText}>Loading orders...</Text>
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
        <Text style={styles.headerTitle}>View Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₱{getTotalRevenue().toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getOrdersByStatus('pending')}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>Orders will appear here once customers place them</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.id.slice(-8)}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Ionicons name={getStatusIcon(order.status)} size={12} color={COLORS.WHITE} />
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={styles.orderTotal}>Total: ₱{order.total.toFixed(2)}</Text>
                  <Text style={styles.orderItems}>{order.items.length} item(s)</Text>
                </View>

                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingLabel}>Shipping Address:</Text>
                  <Text style={styles.shippingText}>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zipCode}
                  </Text>
                  <Text style={styles.shippingText}>Phone: {order.shippingAddress.phone}</Text>
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>Payment: {order.paymentMethod.toUpperCase()}</Text>
                </View>

                {/* Update Status Button */}
                <TouchableOpacity 
                  style={styles.updateStatusButton}
                  onPress={() => showStatusUpdateDialog(order)}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.WHITE} />
                  <Text style={styles.updateStatusText}>Update Status</Text>
                </TouchableOpacity>

                {/* Order Items */}
                <View style={styles.itemsContainer}>
                  <Text style={styles.itemsTitle}>Items:</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity}x • {item.size} • {item.color}
                      </Text>
                      <Text style={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
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
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
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
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  orderItems: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  shippingInfo: {
    marginBottom: 12,
  },
  shippingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  shippingText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  itemDetails: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  updateStatusButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  updateStatusText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});
