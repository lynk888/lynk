import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login/LoginScreen" />
      <Stack.Screen name="EmailSignup/EmailSignupScreen" />
      <Stack.Screen name="EmailVerification/EmailVerificationScreen" />
      <Stack.Screen name="CreateAccount/CreateAccountScreen" />
    </Stack>
  );
}
