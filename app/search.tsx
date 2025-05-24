import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserSearch } from '../components/UserSearch';
import { Stack } from 'expo-router';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Search Users',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <UserSearch />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 