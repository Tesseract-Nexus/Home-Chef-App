import type { SessionResponse } from '@/shared/types/auth';

/**
 * Delivery portal auth service — uses same-origin /bff/ proxy to the auth BFF.
 * In production, Istio VirtualService on delivery.fe3dr.com routes /bff/* to the
 * auth-bff service with x-auth-context: admin, which makes the BFF use the
 * internal Keycloak realm (tesserix-internal) for authentication.
 * This limits access to the same 3 users as the admin portal.
 */
const BFF_URL = (() => {
  const env = import.meta.env.VITE_BFF_URL;
  if (env) return env;
  // In production, use same-origin /bff/ proxy
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/bff`;
  }
  // In development, proxy through vite dev server
  return '/bff';
})();

export const authService = {
  getLoginUrl(options?: { provider?: 'google' | 'facebook'; returnTo?: string }): string {
    const params = new URLSearchParams();
    params.set('returnTo', options?.returnTo || `${window.location.origin}/dashboard`);
    if (options?.provider) {
      params.set('kc_idp_hint', options.provider);
    }
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
      // Ignore errors - clear local state regardless
    }
  },

  async getCsrfToken(): Promise<string | null> {
    try {
      const res = await fetch(`${BFF_URL}/auth/csrf`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.csrfToken || null;
    } catch {
      return null;
    }
  },
};
