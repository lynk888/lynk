import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Header from './Header';
import CreateAccountForm from './CreateAccountForm';

const CreateAccountScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header />
      <Image
        resizeMode="contain"
        source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/0526704644373730249143249ba0391c00bfae15?placeholderIfAbsent=true&apiKey=b3463ce93a5d4046b208184ab25b408e" }}
        style={styles.backButton}
      />
      <CreateAccountForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 480,
    width: '100%',
    paddingBottom: 83,
    flexDirection: 'column',
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  backButton: {
    position: 'relative',
    display: 'flex',
    marginTop: 49,
    marginRight: 63,
    width: 12,
    aspectRatio: 0.55,
  },
});

export default CreateAccountScreen;
