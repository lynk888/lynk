import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SplashScreenComponent = () => {
  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashTitle}>LYNK</Text>
      <Text style={styles.splashSubtitle}>Connect • Chat • Share</Text>
    </View>
  );
};

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

export default SplashScreenComponent; 