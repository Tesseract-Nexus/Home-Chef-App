import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import type { User, LoginCredentials, RegisterData } from '@/shared/types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const {
    user,
    token,
    isLoading: storeLoading,
    setUser,
    setToken,
    clearAuth,
    initialize,
  } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitialized(true);
    };
    init();
  }, [initialize]);

  // Role guard: only allow chef role
  useEffect(() => {
    if (isInitialized && user && user.role !== 'chef') {
      clearAuth();
      navigate('/login?error=access-denied');
    }
  }, [isInitialized, user, clearAuth, navigate]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { authService } = await import('@/features/auth/services/auth-service');
      const response = await authService.login(credentials);

      // Only allow chef role
      if (response.user.role !== 'chef') {
        throw {
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'This portal is only for vendor accounts. Please use the customer app.',
          },
        };
      }

      setUser(response.user);
      setToken(response.token, response.refreshToken);
      navigate('/dashboard');
    },
    [navigate, setUser, setToken]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const { authService } = await import('@/features/auth/services/auth-service');
      const response = await authService.register({ ...data, role: 'chef' });
      setUser(response.user);
      setToken(response.token, response.refreshToken);
      navigate('/dashboard');
    },
    [navigate, setUser, setToken]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (user) {
        setUser({ ...user, ...updates });
      }
    },
    [user, setUser]
  );

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      const { apiClient } = await import('@/shared/services/api-client');
      const updatedUser = await apiClient.put<User>('/chef/profile', data);
      if (user) {
        setUser({ ...user, ...updatedUser });
      }
    },
    [user, setUser]
  );

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!token && !!user,
    isLoading: storeLoading || !isInitialized,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
