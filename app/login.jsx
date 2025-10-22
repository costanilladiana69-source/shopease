import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/colors.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [postLoginLoading, setPostLoginLoading] = useState(false);
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (postLoginLoading && user) {
      setPostLoginLoading(false);
      // Check user role instead of just email
      if (user.role === 'admin') {
        router.replace("/admin/dashboard");
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, postLoginLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password); // Sign in with Firebase
      setPostLoginLoading(true);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };


  const navigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo}
          />
          <Text style={styles.title}>ShopEase</Text>
          <Text style={styles.subtitle}>Simple e-commerce platform for all your shopping needs</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.GRAY_MEDIUM}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.GRAY_MEDIUM}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, (loading || postLoginLoading) && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading || postLoginLoading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : postLoginLoading ? 'Redirecting...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {email === 'admin@gmail.com' && (
            <View style={styles.adminHint}>
              <Text style={styles.adminHintText}>
                Admin Account: admin@gmail.com{'\n'}Password: admin123
              </Text>
              <Text style={styles.adminHintSubtext}>
                If this is your first time, create the admin account from the initialization screen.
              </Text>
              <TouchableOpacity 
                style={styles.quickLoginButton}
                onPress={() => {
                  setEmail('admin@gmail.com');
                  setPassword('admin123');
                }}
              >
                <Text style={styles.quickLoginText}>Quick Fill Admin Credentials</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Dont have an account? </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.WHITE_GRAY,
    color: COLORS.TEXT_PRIMARY,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE_GRAY,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  eyeButton: {
    padding: 12,
    paddingLeft: 8,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
  },
  signupLink: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  adminHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  adminHintText: {
    color: COLORS.WHITE,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  adminHintSubtext: {
    color: COLORS.WHITE,
    opacity: 0.8,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickLoginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  quickLoginText: {
    color: COLORS.WHITE,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  testAccountsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  testAccountsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  testAccountButton: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  testAccountText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

