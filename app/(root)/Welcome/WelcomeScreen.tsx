import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import ProgressDots from './ProgressDots';
import Button from './Button';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/IMAGE2.jpg')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <ProgressDots />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to LYNK!</Text>
          <Text style={styles.subtitle}>Ready to connect with ease?</Text>
          <Text style={styles.subtitle}>Let's get you started!</Text>
        </View>

        <Button title="Register" onPress={() => router.push('/(auth)/EmailSignup/EmailSignupScreen')} />
        <Button title="Login" onPress={() => router.push('/(auth)/Login')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  imageContainer: {
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  image: {
    width: 300,
    height: 500,
    borderRadius: 10,
  }
});

export default WelcomeScreen;
