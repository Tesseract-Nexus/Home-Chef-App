import { apiClient } from '@/shared/services/api-client';
import type { AuthResponse, TokenRefreshResponse, User, LoginCredentials, RegisterData } from '@/shared/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async loginWithSocial(provider: 'google' | 'facebook' | 'apple', token: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/social', { provider, token });
  },

  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    return apiClient.post<TokenRefreshResponse>('/auth/refresh', { refreshToken });
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  async updateUser(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/users/me', data);
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },

  async sendVerificationEmail(): Promise<void> {
    return apiClient.post('/auth/verify-email/send');
  },

  async verifyEmail(token: string): Promise<void> {
    return apiClient.post('/auth/verify-email', { token });
  },

  async sendPhoneOtp(phone: string): Promise<void> {
    return apiClient.post('/auth/verify-phone', { phone });
  },

  async verifyPhoneOtp(phone: string, otp: string): Promise<void> {
    return apiClient.post('/auth/verify-otp', { phone, otp });
  },

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post('/auth/reset-password', { token, password });
  },
};
