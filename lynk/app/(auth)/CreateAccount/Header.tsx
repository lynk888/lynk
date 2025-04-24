import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.timeContainer}>
        <Text>9:41</Text>
      </View>
      <Image
        resizeMode="contain"
        source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/fd44e755ec985c87ec4a33b8c1cae9c5d73f7442?placeholderIfAbsent=true&apiKey=b3463ce93a5d4046b208184ab25b408e" }}
        style={styles.statusIcons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    marginTop: 4,
    width: 389,
    maxWidth: '100%',
    paddingLeft: 52,
    alignItems: 'stretch',
    gap: 20,
    fontFamily: 'SF Pro, sans-serif',
    fontSize: 17,
    color: 'rgba(0, 0, 0, 1)',
    textAlign: 'center',
    lineHeight: 20,
    justifyContent: 'space-between',
  },
  timeContainer: {
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  statusIcons: {
    position: 'relative',
    display: 'flex',
    width: 138,
    flexShrink: 0,
    maxWidth: '100%',
    aspectRatio: 2.56,
  },
});

export default Header;