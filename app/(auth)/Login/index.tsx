import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../../utils/validation';
import { FirebaseAuthService } from '../../../services/firebaseAuth.service';
import { useAuth } from '../../../context/AuthContext';
import { LoginButton } from './LoginButton';
import { Input } from '../../../components/Input';
import { useUserStore } from '../../../store/useStore';
import { StatusBar } from './StatusBar';
import { DotMenu } from './DotMenu';
import { SafeStorage } from '../../../utils/safeStorage';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { setEmail } = useAuth();
  const setIsLoading = useUserStore((state) => state.setIsLoading);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const user = await FirebaseAuthService.signIn(data.email, data.password);
      if (user) {
        setEmail(data.email);
        // Handle the return value from storeToken using SafeStorage
        const tokenStored = await SafeStorage.storeToken(user.uid);
        if (!tokenStored) {
          console.warn('Failed to store authentication token securely');
          // Continue anyway since this is not critical for the app to function
        }
        router.replace('/(root)/Home');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
