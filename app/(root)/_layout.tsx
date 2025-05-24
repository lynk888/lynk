import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RootLayout() {
  const router = useRouter();

  try {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
            Please log in to access this content
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
            onPress={() => router.replace('/(auth)/Login')}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="Home/HomeScreen" />
        <Stack.Screen name="Welcome/WelcomeScreen" />
        <Stack.Screen name="Chat/ChatScreen" />
        <Stack.Screen name="Chat/ChatScreen2" />
        <Stack.Screen name="Chat/NewConversation" />
        <Stack.Screen name="Chat/RealTimeChat" />
        <Stack.Screen name="Chat/Contact/ContactScreen" />
        <Stack.Screen name="Chat/ContactInfo/ContactInfo" />
        <Stack.Screen name="Calls/CallsScreen" />
        <Stack.Screen name="Settings/SettingsScreen" />
        <Stack.Screen name="Settings/UserProfileScreen" />
        <Stack.Screen name="Settings/NotificationsScreen" />
      </Stack>
    );
  } catch (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>Loading authentication...</Text>
      </View>
    );
  }
}