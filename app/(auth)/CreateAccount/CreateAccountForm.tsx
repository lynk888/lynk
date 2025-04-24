import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

const CreateAccountForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { email, setToken } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simplified registration logic
      await setToken('dummy-token');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.label}>username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        accessibilityLabel="Enter username"
        autoCapitalize="none"
      />
      <Text style={styles.helperText}>only use letter, numbers and underscores.</Text>
      <Text style={styles.label}>Password</Text>
      <View style={[styles.input, styles.passwordInputContainer]}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          accessibilityLabel="Enter password"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            resizeMode="contain"
            source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/eec1c142a0c2343e832e86679f5c52ae4f1b8cf8?placeholderIfAbsent=true&apiKey=b3463ce93a5d4046b208184ab25b408e" }}
            style={styles.passwordVisibilityIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[
          styles.submitButton,
          isLoading && styles.submitButtonDisabled
        ]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    display: 'flex',
    marginTop: 29,
    width: '100%',
    paddingLeft: 41,
    paddingRight: 41,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  title: {
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 32,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    lineHeight: 38,
    textAlign: 'center',
    alignSelf: 'center',
  },
  label: {
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 41,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#D9D9D9',
    borderRadius: 6,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    marginBottom: 24,
  },
  helperText: {
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '300',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 12,
  },
  passwordInputContainer: {
    display: 'flex',
    marginTop: 12,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    paddingRight: 0,
    marginBottom: 0,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  passwordVisibilityIcon: {
    width: 30,
    aspectRatio: 2,
    marginRight: 10,
  },
  submitButton: {
    alignSelf: 'stretch',
    marginTop: 298,
    padding: 10,
    backgroundColor: '#7CC2E4',
    borderRadius: 5,
  },
  submitButtonText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 17,
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default CreateAccountForm;
