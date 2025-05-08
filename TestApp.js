import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUserStore } from './store/useStore';

export default function TestApp() {
  const { user, setUser, clearUser, isLoading, setIsLoading } = useUserStore();

  const handleSetUser = () => {
    setUser({ id: '123', email: 'test@example.com' });
  };

  const handleClearUser = () => {
    clearUser();
  };

  const handleToggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>User ID: {user.id || 'None'}</Text>
      <Text>User Email: {user.email || 'None'}</Text>
      <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Button title="Set User" onPress={handleSetUser} />
      <Button title="Clear User" onPress={handleClearUser} />
      <Button title="Toggle Loading" onPress={handleToggleLoading} />
    </View>
  );
}
