import type { SessionResponse, SocialProvider } from '@/shared/types/auth';

const BFF_URL = import.meta.env.VITE_BFF_URL || 'https://identity.fe3dr.com';

export const authService = {
  getLoginUrl(options?: { provider?: SocialProvider; returnTo?: string }): string {
    const params = new URLSearchParams();
    params.set('returnTo', options?.returnTo || `${window.location.origin}/dashboard`);
    if (options?.provider) {
      params.set('kc_idp_hint', options.provider);
    }
    return `${BFF_URL}/auth/login?${params.toString()}`;
  },

  getRegisterUrl(returnTo?: string): string {
    const params = new URLSearchParams();
    params.set('returnTo', returnTo || `${window.location.origin}/dashboard`);
    params.set('kc_action', 'register');
    return `${BFF_URL}/auth/login?${params.toString()}`;
  },

  async getSession(): Promise<SessionResponse | null> {
    try {
      const res = await fetch(`${BFF_URL}/auth/session`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async refreshSession(): Promise<boolean> {
    try {
      const res = await fetch(`${BFF_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BFF_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore
    }
  },
};
