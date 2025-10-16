import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { db } from '../../firebaseConfig.js';
import { COLORS } from '../../constants/colors.js';
import { handleFirestoreError, retryFirebaseOperation } from '../../utils/firebaseErrorHandler.js';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'electronics',
    price: '',
    originalPrice: '',
    description: '',
    images: [''],
    sizes: [''],
    colors: [''],
    rating: '4.5',
    reviewCount: '0',
    inStock: true,
    featured: false,
  });

  const categories = [
    'electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'automotive'
  ];

  // Request permissions for image picker (mobile only)
  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return true; // Web doesn't need permissions
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to add images!');
      return false;
    }
    return true;
  };

  // Pick image from gallery (works on both web and mobile)
  const pickImage = async (index) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: Platform.OS === 'web', // Web needs base64 for display
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...formData.images];
        // For web, use base64 data URL; for mobile, use URI
        const imageUri = Platform.OS === 'web' 
          ? `data:image/jpeg;base64,${result.assets[0].base64}`
          : result.assets[0].uri;
        newImages[index] = imageUri;
        setFormData({ ...formData, images: newImages });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take photo with camera (mobile only, web will use gallery)
  const takePhoto = async (index) => {
    if (Platform.OS === 'web') {
      // On web, just use gallery picker instead of camera
      await pickImage(index);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...formData.images];
        newImages[index] = result.assets[0].uri;
        setFormData({ ...formData, images: newImages });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Show image picker options (web-friendly)
  const showImagePicker = (index) => {
    if (Platform.OS === 'web') {
      // On web, just show gallery option
      pickImage(index);
    } else {
      // On mobile, show both camera and gallery options
      Alert.alert(
        'Select Image',
        'Choose how you want to add an image',
        [
          { text: 'Camera', onPress: () => takePhoto(index) },
          { text: 'Gallery', onPress: () => pickImage(index) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // Real-time listener for products
  useEffect(() => {
    console.log('Setting up real-time products listener for admin...');
    setLoading(true);
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          console.log('Admin products snapshot received:', querySnapshot.docs.length, 'products');
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }));
          console.log('Admin products updated in real-time:', productsData.length);
          setProducts(productsData);
        } catch (error) {
          console.error('Error processing admin products snapshot:', error);
        } finally {
          setLoading(false);
        }
      }, 
      (error) => {
        console.error('Error with admin products listener:', error);
        const errorMessage = handleFirestoreError(error, 'Real-time products listener');
        console.log('Admin products listener error:', errorMessage);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up admin products listener');
      unsubscribe();
    };
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'electronics',
      price: '',
      originalPrice: '',
      description: '',
      images: [''],
      sizes: [''],
      colors: [''],
      rating: '4.5',
      reviewCount: '0',
      inStock: true,
      featured: false,
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description,
      images: product.images.length > 0 ? product.images : [''],
      sizes: product.sizes.length > 0 ? product.sizes : [''],
      colors: product.colors.length > 0 ? product.colors : [''],
      rating: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      inStock: product.inStock,
      featured: product.featured,
    });
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.brand || !formData.price || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await retryFirebaseOperation(async () => {
        const productData = {
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          description: formData.description,
          images: formData.images.filter(img => img.trim() !== ''),
          sizes: formData.sizes.filter(size => size.trim() !== ''),
          colors: formData.colors.filter(color => color.trim() !== ''),
          rating: parseFloat(formData.rating),
          reviewCount: parseInt(formData.reviewCount),
          inStock: formData.inStock,
          featured: formData.featured,
          updatedAt: serverTimestamp(),
        };

        if (editingProduct) {
          await updateDoc(doc(db, 'products', editingProduct.id), productData);
          Alert.alert('Success', 'Product updated successfully');
        } else {
          productData.createdAt = serverTimestamp();
          await addDoc(collection(db, 'products'), productData);
          Alert.alert('Success', 'Product added successfully');
        }
      });

      setModalVisible(false);
      resetForm();
      // Real-time listener will automatically update the products list
    } catch (error) {
      const errorMessage = handleFirestoreError(error, 'Saving product');
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await retryFirebaseOperation(async () => {
                await deleteDoc(doc(db, 'products', product.id));
              });
              Alert.alert('Success', 'Product deleted successfully');
              // Real-time listener will automatically update the products list
            } catch (error) {
              const errorMessage = handleFirestoreError(error, 'Deleting product');
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const updateArrayField = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArray });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
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
        <Text style={styles.headerTitle}>Manage Products</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>Add your first product to get started</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.addFirstText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsList}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productPrice}>₱{product.price}</Text>
                  <View style={styles.productStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: product.inStock ? COLORS.success : COLORS.error }]}>
                      <Text style={styles.statusText}>{product.inStock ? 'In Stock' : 'Out of Stock'}</Text>
                    </View>
                    {product.featured && (
                      <View style={[styles.statusBadge, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.statusText}>Featured</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => openEditModal(product)}
                  >
                    <Ionicons name="pencil" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                    onPress={() => handleDelete(product)}
                  >
                    <Ionicons name="trash" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter product name"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Enter brand name"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setFormData({ ...formData, category })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.selectedCategoryButtonText
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter product description"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Original Price (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.originalPrice}
                onChangeText={(text) => setFormData({ ...formData, originalPrice: text })}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Images */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Images</Text>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={() => showImagePicker(index)}
                  >
                    {image ? (
                      <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="camera" size={32} color={COLORS.textSecondary} />
                        <Text style={styles.placeholderText}>Tap to add image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={() => showImagePicker(index)}
                    >
                      <Ionicons name="camera" size={16} color={COLORS.primary} />
                      <Text style={styles.imageActionText}>Change</Text>
                    </TouchableOpacity>
                    
                    {formData.images.length > 1 && (
                      <TouchableOpacity
                        style={styles.imageActionButton}
                        onPress={() => removeArrayItem('images', index)}
                      >
                        <Ionicons name="trash" size={16} color={COLORS.error} />
                        <Text style={styles.imageActionText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => addArrayItem('images')}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add Another Image</Text>
              </TouchableOpacity>
            </View>

            {/* Sizes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sizes</Text>
              {formData.sizes.map((size, index) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={styles.input}
                    value={size}
                    onChangeText={(text) => updateArrayField('sizes', index, text)}
                    placeholder="Size (e.g., S, M, L, XL)"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                  {formData.sizes.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeArrayItem('sizes', index)}
                    >
                      <Ionicons name="remove-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => addArrayItem('sizes')}
              >
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.addItemText}>Add Size</Text>
              </TouchableOpacity>
            </View>

            {/* Colors */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Colors</Text>
              {formData.colors.map((color, index) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={styles.input}
                    value={color}
                    onChangeText={(text) => updateArrayField('colors', index, text)}
                    placeholder="Color (e.g., Red, Blue, Black)"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                  {formData.colors.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeArrayItem('colors', index)}
                    >
                      <Ionicons name="remove-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => addArrayItem('colors')}
              >
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.addItemText}>Add Color</Text>
              </TouchableOpacity>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.label}>Rating</Text>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={formData.rating}
                  onChangeText={(text) => setFormData({ ...formData, rating: text })}
                  placeholder="4.5"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.label}>Review Count</Text>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={formData.reviewCount}
                  onChangeText={(text) => setFormData({ ...formData, reviewCount: text })}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.label}>In Stock</Text>
                <TouchableOpacity
                  style={[styles.toggle, formData.inStock && styles.toggleActive]}
                  onPress={() => setFormData({ ...formData, inStock: !formData.inStock })}
                >
                  <View style={[styles.toggleThumb, formData.inStock && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.label}>Featured</Text>
                <TouchableOpacity
                  style={[styles.toggle, formData.featured && styles.toggleActive]}
                  onPress={() => setFormData({ ...formData, featured: !formData.featured })}
                >
                  <View style={[styles.toggleThumb, formData.featured && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  addButton: {
    padding: 8,
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
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFirstText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  productsList: {
    gap: 16,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  productStatus: {
    flexDirection: 'row',
    gap: 8,
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
  productActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  smallInput: {
    width: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    marginLeft: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addItemText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageItem: {
    marginBottom: 16,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  imageActionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 4,
    fontWeight: '600',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

