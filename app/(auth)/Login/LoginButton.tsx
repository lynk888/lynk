
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';

interface LoginButtonProps {
  onPress: () => void;
  text?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onPress, text = "Login" }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.accent.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginButton;
