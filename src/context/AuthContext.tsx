import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthSession, AuthService } from '../services/authService';
import { UserRole } from '../types';
import { useApp } from './AppContext';

interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  authModalMode: 'signin' | 'signup';
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOtp: (phone: string, otp: string, name?: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setRole, addToast } = useApp();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const user = session?.user || null;
  const isAuthenticated = !!session;

  // Keep AppContext persona/role synced with authenticated user role
  useEffect(() => {
    if (session?.user?.role) {
      setRole(session.user.role);
    }
  }, [session]);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const sendOtp = async (phone: string) => {
    return await AuthService.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string, name?: string, role: UserRole = 'individual') => {
    const res = await AuthService.verifyOtp(phone, otp, name, role);
    if (res.success && res.session) {
      setSession(res.session);
      setIsAuthModalOpen(false);
      addToast({
        title: 'Signed In',
        description: `Welcome back, ${res.session.user.name}!`,
        type: 'success',
      });
    }
    return { success: res.success, message: res.message };
  };

  const logout = () => {
    AuthService.clearSession();
    setSession(null);
    addToast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
      type: 'info',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
