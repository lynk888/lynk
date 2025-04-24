import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const StatusBar: React.FC = () => {
  return (
    <View style={styles.container}>
       <Image 
         source={{ uri: './assets/images/image1.jpeg' }}
            
            />
      <View style={styles.bar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 20,
    backgroundColor: '#F5F5F5',
  },
  bar: {
    height: '100%',
    backgroundColor: '#7CC2E4',
    width: '30%'
  }
});

export default StatusBar;
