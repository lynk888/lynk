import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../../utils/validation';
import { loginUser } from '../../../servises/authService';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';
import LoginButton from './LoginButton';
import { Input } from '../../../components/Input';
import { useUserStore } from '../../../store/useStore';
import StatusBar from './StatusBar';
import DotMenu from './DotMenu';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { setToken, setEmail } = useAuth();
  const setIsLoading = useUserStore((state) => state.setIsLoading);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const handleForgotPassword = async () => {
    const email = watch('email');
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'lynk://reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Password Reset Email Sent',
          'Please check your email for password reset instructions.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await loginUser(data.email, data.password);
      if (result.success && result.token) {
        setEmail(data.email);
        await setToken(result.token);
        router.replace('/(root)/Chat/ChatScreen');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={errors.password?.message}
          />
        )}
      />

      <LoginButton onPress={handleSubmit(onSubmit)} />
      
      <TouchableOpacity 
        style={styles.forgotPasswordButton} 
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
