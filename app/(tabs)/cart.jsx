import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {
    doc,
    writeBatch
} from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AuthWrapper from '../../components/AuthWrapper.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { db } from '../../firebaseConfig.js';
import { COLORS } from '../../constants/colors.js';

export default function CartScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const { cartItems, loading, updateQuantity, removeFromCart, refreshCart } = useCart();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch {
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const removeSelectedItems = async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Remove Items',
      `Remove ${selectedItems.size} item(s) from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const batch = writeBatch(db);
              selectedItems.forEach(itemId => {
                const itemRef = doc(db, 'cart', itemId);
                batch.delete(itemRef);
              });
              await batch.commit();

              setSelectedItems(new Set());
            } catch (error) {
              console.error('Error removing items:', error);
              Alert.alert('Error', 'Failed to remove items');
            }
          }
        }
      ]
    );
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSelectedTotalPrice = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSelectedItemsCount = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some items to checkout.');
      return;
    }

    router.push('/checkout');
  };

  const renderCartItem = (item) => {
    const isSelected = selectedItems.has(item.id);
    const isUpdating = updating === item.id;

    return (
      <Animated.View 
        key={item.id} 
        style={[
          styles.cartItem,
          isSelected && styles.selectedCartItem
        ]}
      >
        <TouchableOpacity 
          style={styles.selectionButton}
          onPress={() => toggleItemSelection(item.id)}
        >
          <Ionicons 
            name={isSelected ? 'checkbox' : 'square-outline'} 
            size={24} 
            color={isSelected ? COLORS.PRIMARY : COLORS.GRAY_LIGHT} 
          />
        </TouchableOpacity>

        <Image 
          source={{ uri: item.product.images[0] }} 
          style={styles.itemImage}
          resizeMode="cover"
        />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemBrand}>{item.product.brand}</Text>
          <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.itemDetails}>Size: {item.size} | Color: {item.color}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
              <Text style={styles.originalPrice}>₱{item.product.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.WARNING} />
            <Text style={styles.rating}>{item.product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.product.reviewCount})</Text>
          </View>
      </View>

        <View style={styles.itemActions}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Ionicons name="remove" size={16} color={COLORS.WHITE} />
              )}
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
          <TouchableOpacity 
              style={[styles.quantityButton, item.quantity >= 10 && styles.disabledButton]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= 10}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Ionicons name="add" size={16} color={COLORS.WHITE} />
              )}
          </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveFromCart(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <AuthWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Shopping Cart</Text>
            <Text style={styles.itemCount}>{getTotalItems()} items</Text>
          </View>
          
          {cartItems.length > 0 && (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={selectAllItems}
              >
                <Ionicons 
                  name={selectedItems.size === cartItems.length ? 'checkbox' : 'square-outline'} 
                  size={20} 
                  color={COLORS.WHITE} 
                />
                <Text style={styles.selectAllText}>
                  {selectedItems.size === cartItems.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>

              {selectedItems.size > 0 && (
                <TouchableOpacity 
                  style={styles.removeSelectedButton}
                  onPress={removeSelectedItems}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.WHITE} />
                  <Text style={styles.removeSelectedText}>Remove ({selectedItems.size})</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some products to get started!</Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Ionicons name="storefront" size={20} color={COLORS.WHITE} />
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView 
              style={styles.cartList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            >
              {cartItems.map(renderCartItem)}
            </ScrollView>

            {/* Enhanced Checkout Section */}
            <View style={styles.checkoutContainer}>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₱{getTotalPrice().toFixed(2)}</Text>
                </View>
                
                {selectedItems.size > 0 && selectedItems.size < cartItems.length && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Selected Items</Text>
                    <Text style={styles.summaryValue}>₱{getSelectedTotalPrice().toFixed(2)}</Text>
                  </View>
                )}
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>Free</Text>
                </View>
                
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>
                    Total ({selectedItems.size > 0 ? getSelectedItemsCount() : getTotalItems()} items)
                  </Text>
                  <Text style={styles.totalPrice}>
                    ₱{selectedItems.size > 0 ? getSelectedTotalPrice().toFixed(2) : getTotalPrice().toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.checkoutButton} 
                onPress={handleCheckout}
              >
                <Ionicons name="card-outline" size={20} color={COLORS.WHITE} />
                <Text style={styles.checkoutButtonText}>
                  {selectedItems.size > 0 ? 'Checkout Selected' : 'Proceed to Checkout'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </AuthWrapper>
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
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  itemCount: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  selectAllText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
  },
  removeSelectedText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopNowText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cartList: {
    flex: 1,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCartItem: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
  },
  selectionButton: {
    marginRight: 12,
    justifyContent: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemBrand: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginVertical: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: COLORS.WARNING,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.ERROR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  checkoutButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});


