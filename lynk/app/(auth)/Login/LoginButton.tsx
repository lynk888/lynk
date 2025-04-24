import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface LoginButtonProps {}

export const LoginButton: React.FC<LoginButtonProps> = () => {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 42,
    backgroundColor: '#7CC2E4',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 42,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 17,
  },
});