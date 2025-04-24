import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DotMenuProps {}

export const DotMenu: React.FC<DotMenuProps> = () => {
  return (
    <View style={styles.container}>
      <Svg width="37" height="5" viewBox="0 0 37 5">
        <Circle cx="2.5" cy="2.5" r="2.5" fill="#000000" />
        <Circle cx="18.5" cy="2.5" r="2.5" fill="#000000" />
        <Circle cx="34.5" cy="2.5" r="2.5" fill="#000000" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 13,
    top: 94,
  },
});
