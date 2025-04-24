import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressDots: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7CC2E4',
    marginHorizontal: 4,
  }
});

export default ProgressDots;
