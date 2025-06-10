import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  email: string | null;
  userId: string | null;
  setEmail: (email: string | null) => void;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [email, setEmailState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setTokenState(session.access_token);
          setEmailState(session.user.email || null);
          setUserIdState(session.user.id || null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setTokenState(session.access_token);
        setEmailState(session.user.email || null);
        setUserIdState(session.user.id || null);
      } else {
        setTokenState(null);
        setEmailState(null);
        setUserIdState(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear(); // Clear all stored data to prevent state residue
      setTokenState(null);
      setEmailState(null);
      setUserIdState(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear state even if logout fails
      setTokenState(null);
      setEmailState(null);
      setUserIdState(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        token,
        email,
        userId,
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
