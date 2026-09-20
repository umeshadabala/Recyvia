import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LandingPage } from '../../pages/LandingPage';
import { AuthModal } from './AuthModal';
import { UserRole } from '../../types';

export const AuthLandingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, openAuthModal } = useAuth();

  // If authenticated, render full application
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Otherwise render clean, responsive Landing Page
  return (
    <>
      <LandingPage onGetStarted={(_preferredRole?: UserRole) => openAuthModal('signin')} />
      <AuthModal />
    </>
  );
};
