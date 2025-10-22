import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebaseConfig.js';

// Helper function to check if user is admin
export const isAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Helper function to get user data
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Product management functions
export const getProducts = async (limitCount = 20) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data(),
        createdAt: productDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: productDoc.data().updatedAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category, limitCount = 20) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

export const searchProducts = async (searchTerm, limitCount = 20) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef, 
      orderBy('name'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
    
    // Filter products by search term (case-insensitive)
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Cart management functions
export const getCartItems = async (userId) => {
  try {
    const cartRef = collection(db, 'cart');
    const q = query(cartRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const cartItems = [];
    for (const cartDoc of querySnapshot.docs) {
      const cartData = cartDoc.data();
      const productDoc = await getDoc(doc(db, 'products', cartData.productId));
      
      if (productDoc.exists()) {
        cartItems.push({
          id: cartDoc.id,
          ...cartData,
          product: {
            id: productDoc.id,
            ...productDoc.data(),
            createdAt: productDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: productDoc.data().updatedAt?.toDate() || new Date(),
          }
        });
      }
    }
    
    return cartItems;
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
};

export const addToCart = async (userId, productId, size, color, quantity = 1) => {
  try {
    // Check if item already exists in cart
    const cartRef = collection(db, 'cart');
    const q = query(
      cartRef, 
      where('userId', '==', userId),
      where('productId', '==', productId),
      where('size', '==', size),
      where('color', '==', color)
    );
    const existingItems = await getDocs(q);
    
    if (!existingItems.empty) {
      // Update existing item
      const existingItem = existingItems.docs[0];
      const currentQuantity = existingItem.data().quantity;
      await updateDoc(doc(db, 'cart', existingItem.id), {
        quantity: currentQuantity + quantity,
        updatedAt: serverTimestamp()
      });
    } else {
      // Add new item
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        await addDoc(cartRef, {
          userId,
          productId,
          size,
          color,
          quantity,
          price: productData.price * quantity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity <= 0) {
      await deleteDoc(doc(db, 'cart', cartItemId));
    } else {
      const cartItemDoc = await getDoc(doc(db, 'cart', cartItemId));
      if (cartItemDoc.exists()) {
        const cartData = cartItemDoc.data();
        const productDoc = await getDoc(doc(db, 'products', cartData.productId));
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          await updateDoc(doc(db, 'cart', cartItemId), {
            quantity,
            price: productData.price * quantity,
            updatedAt: serverTimestamp()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    await deleteDoc(doc(db, 'cart', cartItemId));
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const cartRef = collection(db, 'cart');
    const q = query(cartRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Order management functions
export const createOrder = async (userId, cartItems, shippingAddress, paymentMethod) => {
  try {
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    const orderData = {
      userId,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price
      })),
      total,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    
    // Clear cart after successful order
    await clearCart(userId);
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (userId, isAdmin = false) => {
  try {
    const ordersRef = collection(db, 'orders');
    let q;
    
    if (isAdmin) {
      q = query(ordersRef, orderBy('createdAt', 'desc'));
    } else {
      q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// User management functions
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastLoginAt: doc.data().lastLoginAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Image upload functions
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToProducts = (callback, limitCount = 20) => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  return onSnapshot(q, (querySnapshot) => {
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
    callback(products);
  });
};

export const subscribeToCart = (userId, callback) => {
  const cartRef = collection(db, 'cart');
  const q = query(cartRef, where('userId', '==', userId));
  
  return onSnapshot(q, async (querySnapshot) => {
    const cartItems = [];
    for (const cartDoc of querySnapshot.docs) {
      const cartData = cartDoc.data();
      const productDoc = await getDoc(doc(db, 'products', cartData.productId));
      
      if (productDoc.exists()) {
        cartItems.push({
          id: cartDoc.id,
          ...cartData,
          product: {
            id: productDoc.id,
            ...productDoc.data(),
            createdAt: productDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: productDoc.data().updatedAt?.toDate() || new Date(),
          }
        });
      }
    }
    callback(cartItems);
  });
};

export const subscribeToOrders = (userId, callback, isAdmin = false) => {
  const ordersRef = collection(db, 'orders');
  let q;
  
  if (isAdmin) {
    q = query(ordersRef, orderBy('createdAt', 'desc'));
  } else {
    q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
    callback(orders);
  });
};


