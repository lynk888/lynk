import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.buttonDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 42,
    backgroundColor: Colors.accent.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 42,
  },
  buttonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  buttonText: {
    color: Colors.text.inverse,
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '500',
  },
});