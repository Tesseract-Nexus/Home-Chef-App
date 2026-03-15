import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import type { SessionUser, SocialProvider } from '@/shared/types/auth';

const BFF_URL = import.meta.env.VITE_BFF_URL || 'https://identity.fe3dr.com';

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  csrfToken: string | null;
  needsOnboarding: boolean;
  onboardingStatus: string;
  login: (provider?: SocialProvider) => void;
  register: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoading,
    csrfToken,
    clearAuth,
    initialize,
  } = useAuthStore();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  // After auth, check if delivery partner profile exists
  useEffect(() => {
    if (!isAuthenticated || isLoading || onboardingChecked) return;

    const checkOnboarding = async () => {
      try {
        const res = await fetch(`${BFF_URL}/api/v1/delivery/onboarding/status`, {
          credentials: 'include',
        });
        if (!res.ok) {
          setNeedsOnboarding(true);
          if (!location.pathname.startsWith('/onboarding')) {
            navigate('/onboarding', { replace: true });
          }
          return;
        }
        const status = await res.json();
        setOnboardingStatus(status.status || '');
        if (status.completed) {
          setNeedsOnboarding(false);
        } else if (status.status === 'not_started') {
          setNeedsOnboarding(true);
          if (!location.pathname.startsWith('/onboarding')) {
            navigate('/onboarding', { replace: true });
          }
        } else {
          // pending_verification - let them use the dashboard but show status
          setNeedsOnboarding(false);
        }
      } catch {
        setNeedsOnboarding(false);
      } finally {
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, isLoading, onboardingChecked, navigate, location.pathname]);

  const login = useCallback((provider?: SocialProvider) => {
    const params = new URLSearchParams();
    params.set('returnTo', `${window.location.origin}/dashboard`);
    if (provider) {
      params.set('kc_idp_hint', provider);
    }
    window.location.href = `${BFF_URL}/auth/login?${params.toString()}`;
  }, []);

  const register = useCallback(() => {
    const params = new URLSearchParams();
    params.set('returnTo', `${window.location.origin}/dashboard`);
    params.set('kc_action', 'register');
    window.location.href = `${BFF_URL}/auth/login?${params.toString()}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BFF_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore
    }
    clearAuth();
    setOnboardingChecked(false);
    setNeedsOnboarding(false);
    navigate('/login');
  }, [clearAuth, navigate]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    csrfToken,
    needsOnboarding,
    onboardingStatus,
    login,
    register,
    logout,
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
