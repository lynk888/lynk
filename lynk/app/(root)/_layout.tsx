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
    </Stack>
  );
}