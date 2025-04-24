import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface StatusBarProps {}

export const StatusBar: React.FC<StatusBarProps> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>9:41</Text>
      </View>
      <View style={styles.iconsContainer}>
        <Svg width="140" height="54" viewBox="0 0 140 54">
          {/* Replace with your actual SVG paths */}
          <Rect x="0" y="0" width="20" height="10" fill="#000" />
          {/* Add other SVG elements as needed */}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 18,
    height: 54,
  },
  timeContainer: {},
  timeText: {
    fontFamily: 'SF Pro',
    fontSize: 17,
    color: '#000',
  },
  iconsContainer: {},
});
