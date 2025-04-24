import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login/index" />
      <Stack.Screen name="EmailSignup/index" />
      <Stack.Screen name="EmailVerification/index" />
      <Stack.Screen name="ForgotPassword/index" />
      <Stack.Screen name="ResetPassword/index" />
    </Stack>
  );
}
