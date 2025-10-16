import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LandingScreen() {
  const handleShopNow = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      {/* Background Image or Gradient */}
      <View style={styles.background}>
        <View style={styles.overlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo}
          />
          <Text style={styles.title}>ShopEase</Text>
          <Text style={styles.subtitle}>Simple e-commerce platform for all your shopping needs</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="storefront" size={32} color="#FFFFFF" />
            <Text style={styles.featureText}>All Products</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
            <Text style={styles.featureText}>Secure Shopping</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flash" size={32} color="#FFFFFF" />
            <Text style={styles.featureText}>Fast Delivery</Text>
          </View>
        </View>

        {/* Shop Now Button */}
        <TouchableOpacity 
          style={styles.shopNowButton}
          onPress={handleShopNow}
        >
          <Ionicons name="storefront" size={24} color="#FF6B35" />
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Discover amazing products for all your shopping needs
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B35',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 60,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 40,
  },
  shopNowText: {
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});