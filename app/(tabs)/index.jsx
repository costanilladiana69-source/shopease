import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AuthWrapper from '../../components/AuthWrapper.jsx';
import ProductModal from '../../components/ProductModal.jsx';
import RealtimeStatus from '../../components/RealtimeStatus.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { db } from '../../firebaseConfig.js';
import { COLORS } from '../../constants/colors.js';
import { handleFirestoreError } from '../../utils/firebaseErrorHandler.js';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  const { cartCount, refreshCart } = useCart();

  const categories = [
    { id: 'all', name: 'All', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'toys', name: 'Toys', icon: '🧸' },
    { id: 'automotive', name: 'Automotive', icon: '🚗' },
  ];

  // Local images showcase - using placeholder images that work on web
  const localImages = [
    { id: 1, source: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', title: 'Nike Shoes', category: 'Sports' },
    { id: 2, source: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', title: 'Elegant Dress', category: 'Clothing' },
    { id: 3, source: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', title: 'Crop Top', category: 'Clothing' },
    { id: 4, source: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', title: 'Wide Leg Pants', category: 'Clothing' },
    { id: 5, source: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', title: 'Lipstick Set', category: 'Beauty' },
    { id: 6, source: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', title: 'Setting Powder', category: 'Beauty' },
    { id: 7, source: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', title: 'Makeup Brushes', category: 'Beauty' },
    { id: 8, source: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', title: 'Liquid Lipstick', category: 'Beauty' },
  ];

  // Real-time listener for products
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setRefreshing(false);
      return;
    }

    console.log('Setting up real-time products listener for user:', user.id);
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          console.log('Products snapshot received:', querySnapshot.docs.length, 'products');
          const productsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Product data:', doc.id, data.name, data.brand, data.category);
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            };
          });
          setProducts(productsData);
          console.log('Products updated in real-time:', productsData.length, 'products');
          console.log('Featured products:', productsData.filter(p => p.featured).length);
        } catch (error) {
          console.error('Error processing products snapshot:', error);
        } finally {
          setRefreshing(false);
        }
      }, 
      (error) => {
        console.error('Error with products listener:', error);
        const errorMessage = handleFirestoreError(error, 'Real-time products listener');
        console.log('Products listener error:', errorMessage);
        setRefreshing(false);
      }
    );

    return () => {
      console.log('Cleaning up products listener');
      unsubscribe();
    };
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Real-time listeners will automatically update the data
    // Just refresh the cart manually
    await refreshCart();
    setRefreshing(false);
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get products for each category
  // Helper present but unused previously removed to satisfy linter

  const renderProductCard = (product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <Image source={{ uri: product.images[0] }} style={styles.productImage} />
      {product.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₱{product.price}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>₱{product.originalPrice}</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={COLORS.WARNING} />
          <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLocalImageCard = (imageItem) => (
    <TouchableOpacity 
      key={imageItem.id} 
      style={styles.localImageCard}
      onPress={() => {
        // Create a mock product for the modal
        const mockProduct = {
          id: `local-${imageItem.id}`,
          name: imageItem.title,
          brand: 'Local Collection',
          category: imageItem.category.toLowerCase(),
          price: 99.99,
          originalPrice: 129.99,
          description: `Beautiful ${imageItem.title.toLowerCase()} from our local collection. High quality and stylish design.`,
          images: [imageItem.source],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Blue'],
          rating: 4.5,
          reviewCount: 25,
          inStock: true,
          featured: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        handleProductPress(mockProduct);
      }}
    >
      <Image 
        source={{ uri: imageItem.source }} 
        style={styles.localImage} 
        onError={(error) => {
          console.log('Image load error:', error);
        }}
      />
      <View style={styles.localImageInfo}>
        <Text style={styles.localImageTitle}>{imageItem.title}</Text>
        <Text style={styles.localImageCategory}>{imageItem.category}</Text>
        <Text style={styles.localImagePrice}>₱99.99</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <AuthWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.displayName}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Ionicons name="cart" size={24} color={COLORS.WHITE} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        </View>

            {/* Real-time Status */}
            <RealtimeStatus />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for products..."
                placeholderTextColor={COLORS.GRAY_MEDIUM}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Local Images Showcase */}
        <View style={styles.localImagesSection}>
          <Text style={styles.sectionTitle}>Our Product Collection</Text>
          <Text style={styles.sectionSubtitle}>Discover amazing products from our local collection</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.localImagesScroll}
          >
            {localImages.map((imageItem) => renderLocalImageCard(imageItem))}
          </ScrollView>
        </View>

          {/* Featured Section */}
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Featured Products' : `Featured ${categories.find(c => c.id === selectedCategory)?.name || 'Products'}`}
            </Text>
            <View style={styles.featuredProductsGrid}>
              {filteredProducts.filter(p => p.featured).slice(0, 4).map((product) => renderProductCard(product))}
            </View>
          </View>

          {/* Category Products */}
          <View style={styles.allProductsSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Products' : `${categories.find(c => c.id === selectedCategory)?.name || 'Products'} (${filteredProducts.length})`}
            </Text>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyProductsContainer}>
                <Text style={styles.emptyProductsText}>
                  {selectedCategory === 'all' 
                    ? 'No products found. Try adjusting your search.' 
                    : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase() || 'products'} found.`}
              </Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredProducts.map((product) => renderProductCard(product))}
              </View>
            )}
          </View>
      </ScrollView>

      {/* Product Modal */}
      <ProductModal
        visible={modalVisible}
        onClose={closeModal}
        product={selectedProduct}
      />
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 60,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: COLORS.WHITE,
  },
  searchInput: {
    backgroundColor: COLORS.WHITE_GRAY,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    color: COLORS.TEXT_PRIMARY,
  },
  categoriesContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    padding: 12,
    marginRight: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minWidth: 80,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  selectedCategoryText: {
    color: COLORS.WHITE,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 20,
    marginBottom: 16,
  },
  featuredProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  allProductsSection: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
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
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginVertical: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
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
  localImagesSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  localImagesScroll: {
    paddingLeft: 0,
  },
  localImageCard: {
    width: 140,
    marginRight: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  localImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  localImageInfo: {
    padding: 12,
  },
  localImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  localImageCategory: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  localImagePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
  emptyProductsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

