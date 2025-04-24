import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/index';

interface VerificationScreenProps {
  onContinue: () => void;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onContinue }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // Auto-navigate to CreateAccount screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.navigate('(auth)');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.verifiedText}>Verified.</Text>
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontFamily: 'Inter',
    fontSize: 24,
    color: '#000',
    marginBottom: 272,
  },
  continueButton: {
    width: 308,
    height: 42,
    backgroundColor: '#7CC2E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: 'Inter',
    fontSize: 17,
    color: '#FFF',
    textAlign: 'center',
  },
});

export default VerificationScreen;
