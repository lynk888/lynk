import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert, StyleSheet } from 'react-native';
import InputField from './InputField';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';
import { SafeStorage } from '../../../utils/safeStorage';

interface LoginScreenProps {}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);

      // Use SafeStorage to store a session marker with retry logic
      // This helps ensure we don't have native crashes during login
      await SafeStorage.storeToken('session-active');

      // Add a small delay to ensure token storage completes
      // This can help prevent race conditions with the navigation
      setTimeout(() => {
        router.replace('/(root)/Chat/ChatScreen1');
      }, 300); // Increased delay for more safety
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subText}>we're excited to have you back!</Text>
        <View style={styles.formContainer}>
          <InputField
            label="Email address"
            placeholder="Enter your email"
            onChangeText={setEmail}
            keyboardType="email-address"
            value={email}
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            onChangeText={setPassword}
            value={password}
            isPassword
          />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>forgot your password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 40,
    paddingTop: 158,
  },
  welcomeText: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  subText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 5,
    color: '#000',
  },
  formContainer: {
    marginTop: 35,
  },
  forgotPassword: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '300',
    color: '#7CC2E4',
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#7CC2E4',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
