import type { ApiResponse, ApiError } from '@/shared/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    // Import dynamically to avoid circular dependencies
    const { useAuthStore } = await import('@/app/store/auth-store');
    return useAuthStore.getState().token;
  }

  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // Use mock service in mock mode
    if (MOCK_MODE) {
      const { mockService } = await import('@/mock/mock-service');
      return mockService.request<T>(method, endpoint, options);
    }

    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const token = await this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      ...fetchOptions,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: response.statusText || 'An error occurred',
        },
      }));
      throw error;
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  async get<T>(endpoint: string, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>('GET', endpoint, { params });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

export const apiClient = new ApiClient(API_URL);
