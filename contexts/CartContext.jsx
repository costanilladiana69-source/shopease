import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebaseConfig.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(undefined);

// ✅ Correct custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// ✅ Correct provider
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const cartRef = collection(db, 'cart');
      const q = query(cartRef, where('userId', '==', user.id));
      const querySnapshot = await getDocs(q);

      const items = await Promise.all(
        querySnapshot.docs.map(async (cartDoc) => {
          const cartData = cartDoc.data();
          const productDoc = await getDocs(
            query(collection(db, 'products'), where('__name__', '==', cartData.productId))
          );
          const product = productDoc.docs[0]?.data();

          return {
            id: cartDoc.id,
            ...cartData,
            product: {
              ...product,
              createdAt: product?.createdAt?.toDate() || new Date(),
              updatedAt: product?.updatedAt?.toDate() || new Date(),
            },
          };
        })
      );

      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for cart changes
  useEffect(() => {
    if (!user || !user.id) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    console.log('Setting up real-time cart listener for user:', user.id);
    setLoading(true);
    const cartRef = collection(db, 'cart');
    const q = query(cartRef, where('userId', '==', user.id));

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        try {
          const items = await Promise.all(
            querySnapshot.docs.map(async (cartDoc) => {
              const cartData = cartDoc.data();
              const productDoc = await getDocs(
                query(collection(db, 'products'), where('__name__', '==', cartData.productId))
              );
              const product = productDoc.docs[0]?.data();

              return {
                id: cartDoc.id,
                ...cartData,
                product: {
                  ...product,
                  createdAt: product?.createdAt?.toDate() || new Date(),
                  updatedAt: product?.updatedAt?.toDate() || new Date(),
                },
              };
            })
          );

          setCartItems(items);
        } catch (error) {
          console.error('Error processing cart snapshot:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error with cart listener:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up cart listener');
      unsubscribe();
    };
  }, [user]);

  const addToCart = async (product, size, color, quantity = 1) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      const existingItem = cartItems.find(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const cartRef = collection(db, 'cart');
        const newItem = {
          userId: user.id,
          productId: product.id,
          size,
          color,
          quantity,
          price: product.price * quantity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(cartRef, newItem);

        const cartItem = {
          id: docRef.id,
          ...newItem,
          product,
        };

        setCartItems((prev) => [...prev, cartItem]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'cart', itemId));
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const itemRef = doc(db, 'cart', itemId);
      const item = cartItems.find((item) => item.id === itemId);

      if (!item) return;

      await updateDoc(itemRef, {
        quantity,
        price: item.product.price * quantity,
        updatedAt: serverTimestamp(),
      });

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity, price: item.product.price * quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const batch = writeBatch(db);
      cartItems.forEach((item) => {
        const itemRef = doc(db, 'cart', item.id);
        batch.delete(itemRef);
      });
      await batch.commit();

      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const refreshCart = async () => {
    setLoading(true);
    await loadCartItems();
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  const value = {
    cartItems,
    cartCount,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
