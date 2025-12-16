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
  loginWithSocial: (provider: 'google' | 'facebook' | 'apple', token: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
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

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { authService } = await import('@/features/auth/services/auth-service');
      const response = await authService.login(credentials);
      setUser(response.user);
      setToken(response.token, response.refreshToken);

      // Redirect based on role
      switch (response.user.role) {
        case 'chef':
          navigate('/chef/dashboard');
          break;
        case 'admin':
        case 'super_admin':
          navigate('/admin/dashboard');
          break;
        case 'delivery':
          navigate('/delivery/dashboard');
          break;
        default:
          navigate('/');
      }
    },
    [navigate, setUser, setToken]
  );

  const loginWithSocial = useCallback(
    async (provider: 'google' | 'facebook' | 'apple', token: string) => {
      const { authService } = await import('@/features/auth/services/auth-service');
      const response = await authService.loginWithSocial(provider, token);
      setUser(response.user);
      setToken(response.token, response.refreshToken);
      navigate('/');
    },
    [navigate, setUser, setToken]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const { authService } = await import('@/features/auth/services/auth-service');
      const response = await authService.register(data);
      setUser(response.user);
      setToken(response.token, response.refreshToken);
      navigate('/');
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

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!token && !!user,
    isLoading: storeLoading || !isInitialized,
    login,
    loginWithSocial,
    register,
    logout,
    updateUser,
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
