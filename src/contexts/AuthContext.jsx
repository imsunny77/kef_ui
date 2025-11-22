import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import * as authService from '../services/auth';
import { setAccessToken, setRefreshToken, getAccessToken, getRefreshToken, clearTokens, hasAccessToken, setUser as setUserStorage, getUser as getUserStorage } from '../utils/tokenManager';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (hasAccessToken()) {
        // Token exists, try to refresh if needed
        const token = getAccessToken();
        const refresh = getRefreshToken();
        
        if (token && refresh) {
          // First, try to load user data from localStorage
          const storedUser = getUserStorage();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Fallback: Decode token to get user info (simple approach)
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const userFromToken = {
                id: payload.user_id,
                email: payload.email || 'user@example.com', // Token might not have email
                user_type: payload.user_type || 'customer',
              };
              setUser(userFromToken);
              setUserStorage(userFromToken); // Persist to localStorage
              setIsAuthenticated(true);
            } catch (e) {
              // If token decode fails, clear and require login
              clearTokens();
              setIsAuthenticated(false);
            }
          }
        }
      }
    } catch (error) {
      clearTokens();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      // Handle both nested and flat response structures
      const responseData = response.data?.data || response.data;
      const { access_token, refresh_token, user: userData } = responseData;
      
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);
      setUserStorage(userData); // Persist user data to localStorage
      setIsAuthenticated(true);
      
      message.success('Login successful!');
      navigate('/products');
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // Handle both nested and flat response structures
      const responseData = response.data?.data || response.data;
      const { access_token, refresh_token, user: newUser } = responseData;
      
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(newUser);
      setUserStorage(newUser); // Persist user data to localStorage
      setIsAuthenticated(true);
      
      message.success('Registration successful!');
      navigate('/products');
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    message.info('Logged out successfully');
    navigate('/login');
  };

  const updateUser = (userData) => {
    setUser(userData);
    setUserStorage(userData); // Persist updated user data to localStorage
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

