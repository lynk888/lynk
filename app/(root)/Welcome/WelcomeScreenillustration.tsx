import React from 'react';
import { View, StyleSheet } from 'react-native';

const WelcomeIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.placeholderImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#E1E1E1',
  }
});

export default WelcomeIllustration;
