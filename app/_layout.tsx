import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { useOnlineStatus } from '../hooks/useOnlineStatus';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function SplashScreenComponent() {
  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashTitle}>LYNK</Text>
      <Text style={styles.splashSubtitle}>Connect • Chat • Share</Text>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
        if (loaded) {
      // Hide splash screen after fonts are loaded
      SplashScreen.hideAsync();
        }
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6', // Light blue
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF', // White
    marginBottom: 8,
    fontFamily: 'SpaceMono',
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#FFFFFF', // White
    opacity: 0.9,
    fontFamily: 'SpaceMono',
    letterSpacing: 1,
  },
});
