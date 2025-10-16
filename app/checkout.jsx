import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthWrapper from '../components/AuthWrapper.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { db } from '../firebaseConfig.js';
import { COLORS } from '../constants/colors.js';

export default function CheckoutScreen() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    province: '',
    zipCode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod = cash on delivery

  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to place an order');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.zipCode || !shippingAddress.phone) {
      Alert.alert('Error', 'Please fill in all shipping address fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        total: totalPrice,
        status: 'pending',
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      await clearCart();
      
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. You will receive a confirmation email shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <AuthWrapper>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some items to your cart before checkout</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity}x • {item.size} • {item.color}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>₱{(item.product.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₱{totalPrice.toFixed(2)}</Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.street}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, street: text })}
              placeholder="Enter street address"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
            />

            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.city}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
              placeholder="Enter city"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
            />

            <Text style={styles.label}>Province *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.province}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, province: text })}
              placeholder="Enter province"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
            />

            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.zipCode}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, zipCode: text })}
              placeholder="Enter ZIP code"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.phone}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              keyboardType="phone-pad"
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cod' && styles.selectedPaymentOption]}
              onPress={() => setPaymentMethod('cod')}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name="cash-outline" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentDescription}>Pay when you receive your order</Text>
                </View>
              </View>
              <View style={[styles.radioButton, paymentMethod === 'cod' && styles.radioButtonSelected]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPaymentOption]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name="card-outline" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentTitle}>Credit/Debit Card</Text>
                  <Text style={styles.paymentDescription}>Pay securely with your card</Text>
                </View>
              </View>
              <View style={[styles.radioButton, paymentMethod === 'card' && styles.radioButtonSelected]} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, loading && styles.disabledButton]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <Text style={styles.placeOrderText}>
              {loading ? 'Placing Order...' : `Place Order - ₱${totalPrice.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  section: {
    backgroundColor: COLORS.WHITE,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 12,
  },
  selectedPaymentOption: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '10',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDetails: {
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  paymentDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  radioButtonSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  placeOrderButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.TEXT_LIGHT,
  },
  placeOrderText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
});