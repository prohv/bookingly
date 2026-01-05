import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';

interface AuthGuardProps {
  user: User | null;
  children: React.ReactElement;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};