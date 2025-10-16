import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext.jsx';
import { COLORS } from '../constants/colors.js';

export default function AuthWrapper({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('AuthWrapper - user:', user ? 'exists' : 'null', 'loading:', loading);
    if (!loading && !user) {
      console.log('AuthWrapper - redirecting to login');
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading) {
    console.log('AuthWrapper - showing loading');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.WHITE} />
      </View>
    );
  }

  if (!user) {
    console.log('AuthWrapper - no user, returning null');
    return null;
  }

  console.log('AuthWrapper - rendering children');
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
  },
});


