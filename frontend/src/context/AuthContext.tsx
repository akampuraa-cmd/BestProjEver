import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login(email, password);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles: Role[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
