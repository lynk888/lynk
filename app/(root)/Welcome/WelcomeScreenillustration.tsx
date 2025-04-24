import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const WelcomeIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: './assets/images/image1.jpeg' }}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    alignItems: 'center',
  }
});

export default WelcomeIllustration;
