import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/index';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <LinearGradient
          colors={['rgba(34, 157, 209, 0.59)', 'rgba(54, 141, 217, 0.68)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoCircle}
        />
        <Text style={styles.logoText}>LYNK</Text>
        <View style={[styles.square, styles.square1]} />
        <View style={[styles.square, styles.square2]} />
        <View style={[styles.square, styles.square3]} />
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoText: {
    position: 'absolute',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Sen',
  },
  square: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  square1: {
    left: '31%',
    top: '67%',
  },
  square2: {
    left: '45%',
    top: '75%',
  },
  square3: {
    left: '61%',
    top: '83%',
  },
});

export default SplashScreen;