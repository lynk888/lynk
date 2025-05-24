import React from 'react';
import { Stack } from 'expo-router';
import { Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
  try {
    // This will throw an error if used outside AuthProvider
    useAuth();

    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login/index" />
        <Stack.Screen name="EmailSignup/index" />
        <Stack.Screen name="EmailVerification/index" />
        <Stack.Screen name="CreateAccount/CreateAccountScreen" />
      </Stack>
    );
  } catch (error) {
    // Return a loading state when auth is not ready
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>Loading authentication...</Text>
      </View>
    );
  }
}
