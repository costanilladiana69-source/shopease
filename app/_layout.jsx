import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import { CartProvider } from '../contexts/CartContext.jsx';

console.log('DEBUG RootLayout imports:');
console.log('AuthProvider =', AuthProvider);
console.log('CartProvider =', CartProvider);
console.log('Stack =', typeof Stack);

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="init" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}


