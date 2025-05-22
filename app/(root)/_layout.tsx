import { Stack } from "expo-router";

export default function RootLayout() {
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
      <Stack.Screen name="Chat/Contact/ContactScreen" />
      <Stack.Screen name="Chat/ContactInfo/ContactInfo" />
      <Stack.Screen name="Calls/CallsScreen" />
      <Stack.Screen name="Settings/SettingsScreen" />
      <Stack.Screen name="Settings/NotificationsScreen" />
    </Stack>
  );
}