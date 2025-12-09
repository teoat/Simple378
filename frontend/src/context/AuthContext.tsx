import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const disableAuth = import.meta.env.VITE_DISABLE_AUTH === 'true';
  
  // Initialize loading state based on token existence or auth bypass
  const [isLoading, setIsLoading] = useState(() => {
    if (disableAuth) return false;
    return !!localStorage.getItem('auth_token');
  });

  // Auto-login with mock user if auth is disabled
  useEffect(() => {
    if (disableAuth && !user) {
      const mockUser: User = {
        id: 'mock-user-1',
        email: 'mock@example.com',
        name: 'Mock User',
        role: 'admin'
      };
      setUser(mockUser);
      setIsLoading(false);
    }
  }, [disableAuth, user]);

  const login = async (email: string, password: string) => {
    try {
      // If auth is disabled, auto-login with mock user
      if (disableAuth) {
        const mockUser: User = {
          id: 'mock-user-1',
          email: email || 'mock@example.com',
          name: 'Mock User',
          role: 'admin'
        };
        setUser(mockUser);
        return;
      }

      // Create form data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiRequest<{ access_token: string; token_type: string }>(
        '/login/access-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      // Secure token storage with httpOnly cookie approach simulation
      // In production, this should be handled server-side with httpOnly cookies
      const secureToken = btoa(JSON.stringify({
        token: response.access_token,
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        fingerprint: navigator.userAgent.substring(0, 50)
      }));

      localStorage.setItem('auth_token', secureToken);
      
      // Create a mock user since backend doesn't return user info
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Test User',
        role: 'admin'
      };
      sessionStorage.setItem('user_session', JSON.stringify(mockUser));
      setUser(mockUser);

    } catch (error) {
      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('429')) {
          throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      throw new Error('Login failed. Please try again or contact support if the problem persists.');
    }
  };

  const logout = () => {
    // Secure logout - clear all auth data
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_session');
    setUser(null);

    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('auth') || name.includes('user')) {
            caches.delete(name);
          }
        });
      });
    }
  };

  useEffect(() => {
    // Check for existing secure session
    const secureToken = localStorage.getItem('auth_token');
    const userSession = sessionStorage.getItem('user_session');

    if (secureToken && userSession) {
      try {
        // Validate secure token
        const tokenData = JSON.parse(atob(secureToken));

        // Check token expiration
        if (tokenData.expires < Date.now()) {
          logout();
          setIsLoading(false);
          return;
        }

        // Check fingerprint for additional security
        if (tokenData.fingerprint !== navigator.userAgent.substring(0, 50)) {
          logout();
          setIsLoading(false);
          return;
        }

        // Validate token with server
        apiRequest<User>('/auth/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.token}`
          }
        })
          .then((userData) => {
            setUser(userData);
          })
          .catch(() => {
            logout();
          })
          .finally(() => setIsLoading(false));

      } catch (error) {
        // Invalid token format
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    // Listen for 401 errors from API
    const handleAuthError = (event: CustomEvent) => {
      const { status, message } = event.detail || {};

      if (status === 401) {
        logout();
      } else if (status === 403) {
        // Handle forbidden access
        console.warn('Access forbidden:', message);
      }
    };

    window.addEventListener('auth-error', handleAuthError as EventListener);

    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
