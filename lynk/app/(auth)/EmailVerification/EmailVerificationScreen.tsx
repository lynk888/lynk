import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import LoadingIcon from './LoadingIcon';

interface EmailVerificationScreenProps {}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // First timeout: Navigate to Verification screen after 10 seconds
    const verificationTimer = setTimeout(() => {
      navigation.navigate('CreateAccount');
    }, 10000);

    return () => {
      clearTimeout(verificationTimer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LoadingIcon />
      <Text style={styles.verificationText}>verifying email address.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationText: {
    fontFamily: 'Inter',
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
  },
});

export default EmailVerificationScreen;
