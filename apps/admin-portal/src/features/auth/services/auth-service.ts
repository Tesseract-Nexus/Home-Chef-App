import type { SessionResponse } from '@/shared/types/auth';

/**
 * Admin auth BFF URL — points to internal-identity.fe3dr.com which uses the
 * internal Keycloak realm (tesserix-internal) instead of the customer realm.
 * This ensures admin users are managed in a completely separate identity provider.
 */
const BFF_URL = import.meta.env.VITE_BFF_URL || 'https://internal-identity.fe3dr.com';

export const authService = {
  /**
   * Build the OIDC login URL via the internal identity BFF.
   * No social providers — admin login is email/password only via internal Keycloak.
   */
  getLoginUrl(options?: { returnTo?: string }): string {
    const params = new URLSearchParams();
    params.set('returnTo', options?.returnTo || `${window.location.origin}/dashboard`);
    return `${BFF_URL}/auth/login?${params.toString()}`;
  },

  /**
   * Check current session with the internal identity BFF.
   */
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

  /**
   * Refresh the session access token via BFF.
   */
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

  /**
   * Logout: revoke session at BFF and clear cookies.
   */
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

  /**
   * Get CSRF token for state-changing API requests.
   */
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
