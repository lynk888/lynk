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
      <Stack.Screen name="Calls/CallsScreen" /> 
      <Stack.Screen name="Chat/ChatScreen" /> 
      <Stack.Screen name="Chat/ChatScreen2" /> 
      <Stack.Screen name="Settings/SettingsScreen" /> 
     <Stack.Screen name="Settings/Privacy" /> 
      <Stack.Screen name="Settings/Storage" /> 
      <Stack.Screen name="Settings/Help" /> 
      <Stack.Screen name="Terms" />
    </Stack>
  );
}