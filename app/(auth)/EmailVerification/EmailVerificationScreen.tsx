import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../context/AuthContext';

export default function EmailVerificationScreen() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { email, setToken } = useAuth();

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email!,
        token: verificationCode,
        type: 'email',
      });

      if (error) throw error;

      if (data?.user) {
        // Update user metadata to mark email as confirmed
        const { error: updateError } = await supabase.auth.updateUser({
          data: { email_confirmed: true }
        });

        if (updateError) throw updateError;

        // Get the session after verification
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          await setToken(session.access_token);
          router.replace('/(root)/Chat/ChatScreen');
        } else {
          throw new Error('No session found after verification');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address found');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      Alert.alert('Success', 'Verification code resent! Please check your email.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a verification code to {email}
      </Text>
      <Text style={styles.hint}>
        Please check your spam folder if you don't see it in your inbox.
      </Text>

      <TextInput
        style={styles.input}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="Enter verification code"
        keyboardType="number-pad"
        maxLength={6}
        autoCapitalize="none"
        placeholderTextColor="#888"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleVerification}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Verify Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendCode}
        disabled={isResending}
      >
        {isResending ? (
          <ActivityIndicator color="#7CC2E4" />
        ) : (
          <Text style={styles.resendText}>Resend Code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
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
    textAlign: 'center',
    letterSpacing: 8,
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
  resendButton: {
    marginTop: 16,
    padding: 8,
    height: 40,
    justifyContent: 'center',
  },
  resendText: {
    color: '#7CC2E4',
    fontSize: 14,
    textAlign: 'center',
  },
});
