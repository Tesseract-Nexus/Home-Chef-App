import { apiClient } from '@/shared/services/api-client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  TokenRefreshResponse,
  User,
} from '@/shared/types/auth';

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', { ...data, role: 'chef' }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<TokenRefreshResponse>('/auth/refresh', { refreshToken }),

  getCurrentUser: () => apiClient.get<User>('/auth/me'),

  updateUser: (data: Partial<User>) => apiClient.put<User>('/auth/me', data),

  logout: () => apiClient.post<void>('/auth/logout'),

  forgotPassword: (email: string) =>
    apiClient.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<void>('/auth/reset-password', { token, password }),
};
