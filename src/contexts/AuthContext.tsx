import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSignup, useSignin, useLogout } from '@/hooks/auth';

interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, role: 'user' | 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { user: userData, token } = await useSignin({ username, password });
      setUser(userData);
      // Store user data in localStorage as well
      localStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, password: string, role: 'user' | 'admin'): Promise<boolean> => {
    try {
      const { user: userData, token } = await useSignup({ username, password, role });
      setUser(userData);
      // Store user data in localStorage as well
      localStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Re-throw the error so it can be caught in the component
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await useLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear user state regardless of API call success
      setUser(null);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userData');
      // Force page reload to clear any cached state
      window.location.href = '/login';
    }
  };

  // Check for existing token and user data on app load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUserData = localStorage.getItem('userData');

    if (token && storedUserData) {
      try {
        // Verify token is still valid by checking expiration
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          // Token is still valid, restore user data
          const userData = JSON.parse(storedUserData);
          setUser(userData);
        } else {
          // Token expired, clear everything
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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
