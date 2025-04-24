import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
  setEmail: (email: string | null) => void;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [email, setEmailState] = useState<string | null>(null);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await AsyncStorage.setItem('userToken', newToken);
    } else {
      await AsyncStorage.removeItem('userToken');
    }
    setTokenState(newToken);
  };

  const setEmail = (newEmail: string | null) => {
    setEmailState(newEmail);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setTokenState(null);
    setEmailState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        email,
        setEmail,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
