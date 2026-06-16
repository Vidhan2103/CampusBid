import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, switchMode as switchModeApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getProfile();
          setUser(data);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const switchMode = async (mode) => {
    const { data } = await switchModeApi(mode);
    setUser(data);
    return data;
  };

  const value = {
    user,
    loading,
    loginUser,
    logout,
    switchMode,
    isAuthenticated: !!user,
    isSellerMode: user?.currentMode === 'seller',
    isBuyerMode: user?.currentMode === 'buyer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
