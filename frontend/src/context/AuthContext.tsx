import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, setAuthToken, clearAuthToken } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('auth_token');
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await api.getProfile();
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          clearAuthToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  // Listen for 401 unauthorized logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsAuthenticated(false);
      toast.error('Your session has expired. Please log in again.');
      navigate('/login');
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      setAuthToken(response.access_token);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Handle specific ApiError cases if needed
      // @ts-expect-error - checking for custom property
      if (error?.name === 'ApiError') {
         // @ts-expect-error - checking for custom property
        const status = error?.status;
        if (status === 400 || status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 500) {
          errorMessage = 'Server error - please try again later';
        }
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
