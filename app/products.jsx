import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
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
import { db } from '../firebaseConfig.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'sneakers',
    price: '',
    originalPrice: '',
    description: '',
    images: [],
    sizes: [''],
    colors: [''],
    rating: '4.5',
    reviewCount: '0',
    inStock: true,
    featured: false,
  });

  const { user } = useAuth();

  // Real-time listener for products
  useEffect(() => {
    console.log('Setting up real-time products listener...');
    setLoading(true);
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          console.log('Products snapshot received:', querySnapshot.docs.length, 'products');
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }));
          setProducts(productsData);
          console.log('Products updated in real-time:', productsData.length);
        } catch (error) {
          console.error('Error processing products snapshot:', error);
        } finally {
          setLoading(false);
        }
      }, 
      (error) => {
        console.error('Error with products listener:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up products listener');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Permission to access media library is required to upload images.');
      }
    })();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'electronics',
      price: '',
      originalPrice: '',
      description: '',
      images: [],
      sizes: [''],
      colors: [''],
      rating: '4.5',
      reviewCount: '0',
      inStock: true,
      featured: false,
    });
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      rating: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      inStock: product.inStock,
      featured: product.featured,
    });
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.brand || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
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
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Product added successfully');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const pickImage = async () => {
    try {
      // Check authentication and admin role
      if (!user || user.role !== 'admin') {
        Alert.alert('Access denied', 'You must be an admin to upload images.');
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const uri = asset.uri;
        console.log('Selected image URI:', uri);

        // Get base64 from ImagePicker result
        const base64 = asset.base64;
        if (!base64) {
          throw new Error('Failed to get base64 from image');
        }
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        console.log('Image base64 data URL length:', dataUrl.length);

        // Add to images
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, dataUrl],
        }));
        Alert.alert('Success', 'Image added!');
      }
    } catch (error) {
      console.error('Error picking/saving image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to save image: ${errorMessage}`);
    }
  };

  const renderProductCard = (product) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>₱{product.price}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(product)}
          >
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(product.id)}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Products</Text>
        <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {products.map(renderProductCard)}
        </View>
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={handleSaveProduct} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
                placeholder="Enter brand name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {['electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'automotive'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.selectedCategory
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category }))}
                  >
                    <Text style={[
                      styles.categoryText,
                      formData.category === category && styles.selectedCategoryText
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price (₱) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Original Price (₱)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.originalPrice}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, originalPrice: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter product description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Images</Text>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeArrayItem('images', index)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addArrayButton}
                onPress={pickImage}
              >
                <Ionicons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addArrayText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sizes</Text>
              {formData.sizes.map((size, index) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    value={size}
                    onChangeText={(text) => updateArrayItem('sizes', index, text)}
                    placeholder="Size (e.g., 8, 9, 10)"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeArrayItem('sizes', index)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addArrayButton}
                onPress={() => addArrayItem('sizes')}
              >
                <Ionicons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addArrayText}>Add Size</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Colors</Text>
              {formData.colors.map((color, index) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    value={color}
                    onChangeText={(text) => updateArrayItem('colors', index, text)}
                    placeholder="Color (e.g., Red, Blue, Black)"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeArrayItem('colors', index)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addArrayButton}
                onPress={() => addArrayItem('colors')}
              >
                <Ionicons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addArrayText}>Add Color</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Rating</Text>
                <TextInput
                  style={styles.input}
                  value={formData.rating}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, rating: text }))}
                  placeholder="4.5"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Review Count</Text>
                <TextInput
                  style={styles.input}
                  value={formData.reviewCount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, reviewCount: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>In Stock</Text>
                <TouchableOpacity
                  style={[styles.switch, formData.inStock && styles.switchActive]}
                  onPress={() => setFormData(prev => ({ ...prev, inStock: !prev.inStock }))}
                >
                  <View style={[styles.switchThumb, formData.inStock && styles.switchThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Featured</Text>
                <TouchableOpacity
                  style={[styles.switch, formData.featured && styles.switchActive]}
                  onPress={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                >
                  <View style={[styles.switchThumb, formData.featured && styles.switchThumbActive]} />
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E3A8A',
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E3A8A',
    paddingTop: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  selectedCategory: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  addArrayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  addArrayText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#3B82F6',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
});
