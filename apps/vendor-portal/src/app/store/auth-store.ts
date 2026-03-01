import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/shared/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setToken: (token, refreshToken) => set({ token, refreshToken }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        const { token, refreshToken } = get();

        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const { authService } = await import(
            '@/features/auth/services/auth-service'
          );

          const user = await authService.getCurrentUser();
          set({ user, isLoading: false });
        } catch {
          if (refreshToken) {
            try {
              const { authService } = await import(
                '@/features/auth/services/auth-service'
              );
              const response = await authService.refreshToken(refreshToken);
              set({
                token: response.token,
                refreshToken: response.refreshToken,
                isLoading: false,
              });

              const user = await authService.getCurrentUser();
              set({ user });
            } catch {
              set({ ...initialState, isLoading: false });
            }
          } else {
            set({ ...initialState, isLoading: false });
          }
        }
      },
    }),
    {
      name: 'vendor-portal-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
