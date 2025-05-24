import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';

const CreateAccountForm: React.FC = () => {
  const router = useRouter();
  const { email, setToken } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // First, sign up with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email!,
        password: password,
        options: {
          data: {
            username: username,
            email_confirmed: true
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.session?.access_token) {
        // Create a profile record manually as a fallback
        try {
          if (signUpData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: signUpData.user.id,
                email: email!,
                username: username,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });

            if (profileError) {
              console.log('Profile creation fallback error:', profileError);
              // Continue anyway, as the trigger should handle this
            }
          }
        } catch (profileErr) {
          console.log('Profile creation attempt error:', profileErr);
          // Continue anyway, as this is just a fallback
        }

        await setToken(signUpData.session.access_token);
        router.replace('/(root)/Chat/ChatScreen');
      } else {
        throw new Error('No session found after sign up');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Choose a username and password</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a username"
        autoCapitalize="none"
        placeholderTextColor="#888"
        editable={!isLoading}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#D9D9D9',
    borderRadius: 6,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 80,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  showPasswordText: {
    color: '#7CC2E4',
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#7CC2E4',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateAccountForm;
