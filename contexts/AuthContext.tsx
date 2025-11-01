import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, isIncognito?: boolean) => Promise<void>;
  signup: (email: string, pass: string, isIncognito?: boolean) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isIncognito: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIncognito, setIsIncognito] = useState(false);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      const storedIncognito = sessionStorage.getItem('isIncognito');

      if (storedUser && storedIncognito !== 'true') {
        setUser(JSON.parse(storedUser));
        setIsIncognito(false);
      } else {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isIncognito');
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleAuth = (loggedInUser: User, incognito: boolean) => {
    setUser(loggedInUser);
    setIsIncognito(incognito);
    if (!incognito) {
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));
      sessionStorage.setItem('isIncognito', 'false');
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.setItem('isIncognito', 'true');
    }
  };

  const login = async (email: string, pass: string, incognito = false) => {
    const loggedInUser = await api.login(email, pass);
    handleAuth(loggedInUser, incognito);
  };

  const signup = async (email: string, pass: string, incognito = false) => {
    const newUser = await api.signup(email, pass);
    handleAuth(newUser, incognito);
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isIncognito');
    setUser(null);
    setIsIncognito(false);
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (!user) throw new Error("Not authenticated");
    const updatedUser = await api.updateUserProfile(user.email, profileData);
    setUser(updatedUser);
     if (!isIncognito) {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserProfile, isLoading, isIncognito }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
