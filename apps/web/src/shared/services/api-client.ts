import type { ApiError } from '@/shared/types';

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

  private async getCsrfToken(): Promise<string | null> {
    // Import dynamically to avoid circular dependencies
    const { useAuthStore } = await import('@/app/store/auth-store');
    return useAuthStore.getState().csrfToken;
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
      const mockOptions = {
        params: options.params,
        body: typeof options.body === 'string' ? options.body : undefined,
      };
      return mockService.request<T>(method, endpoint, mockOptions);
    }

    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF token for state-changing requests
    if (method !== 'GET') {
      const csrfToken = await this.getCsrfToken();
      if (csrfToken) {
        (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
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

    const json = await response.json();
    // Paginated endpoints return { data: [], pagination: {} } — unwrap to data array.
    // Non-paginated endpoints return the object directly.
    if (json && typeof json === 'object' && 'data' in json && 'pagination' in json) {
      return json as T;
    }
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }
    return json as T;
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
