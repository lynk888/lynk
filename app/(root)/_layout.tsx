import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RootLayout() {
  const router = useRouter();

  try {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ADD8E6" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#2F4F4F' }}>
          Loading...
        </Text>
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
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home/HomeScreen" />
          <Stack.Screen name="Contacts/ContactsScreen" />
          <Stack.Screen name="Chat/ChatScreen" />
          <Stack.Screen name="Chat/NewConversation" />
          <Stack.Screen name="Chat/RealTimeChat" />
          <Stack.Screen name="Chat/Contact/ContactScreen" />
          <Stack.Screen name="Chat/ContactInfo/ContactInfo" />
          <Stack.Screen name="Calls/CallsScreen" />
          <Stack.Screen name="Settings/SettingsScreen" />
          <Stack.Screen name="Settings/UserProfileScreen" />
          <Stack.Screen name="Settings/NotificationsScreen" />
        </>
      ) : (
        <Stack.Screen name="Welcome/WelcomeScreen" />
      )}
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