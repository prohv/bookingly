import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { LoginPage } from './pages/LoginPage';
import { BookingPage } from './pages/BookingPage';
import { ModifyBookingPage } from './pages/ModifyBookingPage';
import { AuthGuard } from './components/AuthGuard';

// Auth Context for global state
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const App: React.FC = () => {
  // Persist user in local storage for refresh convenience in this mock
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bookingly_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bookingly_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bookingly_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
          
          <Route 
            path="/" 
            element={
              <AuthGuard user={user}>
                <BookingPage />
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/modify" 
            element={
              <AuthGuard user={user}>
                <ModifyBookingPage />
              </AuthGuard>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;