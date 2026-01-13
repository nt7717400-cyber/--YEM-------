'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const router = useRouter();
  const pathname = usePathname();

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Check for session timeout (Requirement 6.5)
  useEffect(() => {
    if (!user) return;

    const checkTimeout = () => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        // Session expired
        api.setToken(null);
        setUser(null);
        router.replace('/admin/login');
      }
    };

    const interval = setInterval(checkTimeout, 60000); // Check every minute

    // Add activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user, lastActivity, router, updateActivity]);

  // Check authentication on mount
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      const isValid = await api.verifyToken();
      if (!isValid) {
        api.setToken(null);
        setUser(null);
        return false;
      }
      
      // Token is valid, get user info from token verification
      // For now, we'll just set a basic user object
      // The actual user data comes from the verify endpoint
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      return true;
    } catch {
      api.setToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect unauthenticated users from admin routes (Requirement 6.4)
  useEffect(() => {
    if (isLoading) return;
    
    const isAdminRoute = pathname?.startsWith('/admin') && pathname !== '/admin/login';
    
    if (isAdminRoute && !user) {
      router.replace('/admin/login');
    }
  }, [isLoading, user, pathname, router]);

  const login = async (username: string, password: string) => {
    const response = await api.login({ username, password });
    const userData = { id: response.user.id, username: response.user.username };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setLastActivity(Date.now());
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
      router.replace('/admin/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
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
