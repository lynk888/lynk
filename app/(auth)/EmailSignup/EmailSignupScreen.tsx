import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import Header from './Header';
import EmailForm from './EmailForm';

const EmailSignupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setEmail } = useAuth();

  const handleContinue = (email: string) => {
    setEmail(email);
    navigation.navigate('EmailVerification');
  };

  return (
    <SafeAreaView edges={['top']}>
      <View style={styles.container}>
        <Header />
        <EmailForm onSubmit={handleContinue} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 20,
  },
});

export default EmailSignupScreen;
