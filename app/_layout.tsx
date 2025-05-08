import { Stack } from 'expo-router';
import { useColorScheme, Alert } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Handle errors at the app level
  const handleError = (error: Error) => {
    console.error('App-level error caught:', error);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <AuthProvider>
        <Stack>
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(root)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              presentation: 'modal',
              headerShown: true
            }}
          />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}
