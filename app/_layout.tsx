import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { useOnlineStatus } from '../hooks/useOnlineStatus';
import SplashScreenComponent from '../components/SplashScreenComponent';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('Error loading fonts:', error);
    }
  }, [error]);

  useEffect(() => {
    async function prepare() {
      try {
        if (loaded) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }

    prepare();
  }, [loaded]);

  // Initialize online status (temporarily disabled)
  // useOnlineStatus();

  if (!loaded) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(root)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="+not-found"
            options={{
              presentation: 'modal',
              headerShown: true
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
