import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<User>) => void;
  logout: () => void;
  pendingResetEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingResetEmail, setPendingResetEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check initial auth state from storage
    const current = storage.getCurrentUser();
    setUser(current);
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 300));
    const defaultUser: User = {
      id: 'USR-001',
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Sarah Jenkins',
      email: email || 'sarah.jenkins@stocksense.io',
      role: 'INVENTORY_MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      warehouseName: 'Main Warehouse',
      createdAt: '2025-01-15T08:00:00Z',
    };
    storage.setCurrentUser(defaultUser);
    setUser(defaultUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 350));
    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: 'INVENTORY_MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      warehouseName: 'Main Warehouse',
      createdAt: new Date().toISOString(),
    };
    storage.setCurrentUser(newUser);
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 300));
    setPendingResetEmail(email);
    return true;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 300));
    return otp.length === 6;
  };

  const resetPassword = async (): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 350));
    setPendingResetEmail(null);
    return true;
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    storage.setCurrentUser(updated);
    setUser(updated);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    storage.setCurrentUser(updated);
    setUser(updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stocksense_current_user_v1');
  };

  const role: UserRole = user?.role || 'INVENTORY_MANAGER';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        forgotPassword,
        verifyOtp,
        resetPassword,
        switchRole,
        updateProfile,
        logout,
        pendingResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
