import { FEATURE_FLAGS, API_CONFIG, isFeatureEnabled } from '@/config/featureFlags';

// Mock data
const MOCK_RESPONSES = {
  login: {
    success: true,
    user: {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      role: 'customer',
    },
    token: 'mock-jwt-token'
  },
  sendOTP: {
    success: true,
    message: 'OTP sent successfully',
    otpId: 'mock-otp-id'
  },
  verifyOTP: {
    success: true,
    message: 'OTP verified successfully',
    user: {
      id: '1',
      phone: '+919876543210',
      name: 'Test User',
      role: 'customer',
    },
    token: 'mock-jwt-token'
  },
  socialLogin: {
    success: true,
    user: {
      id: 'social_' + Date.now(),
      email: 'customer@social.com',
      name: 'Social Login User',
      role: 'customer',
    },
    token: 'mock-jwt-token'
  }
};

// API Service class
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Generic API call method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    mockResponse?: T
  ): Promise<T> {
    if (isFeatureEnabled('USE_MOCK_DATA') && mockResponse) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isFeatureEnabled('ENABLE_DEBUG_LOGS')) {
        console.log(`[MOCK API] ${endpoint}:`, mockResponse);
      }
      
      return mockResponse;
    }

    // Real API call
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (isFeatureEnabled('ENABLE_DEBUG_LOGS')) {
      console.log(`[REAL API] ${endpoint}:`, data);
    }
    
    return data;
  }

  // Authentication APIs
  async login(email: string, password: string, role: string) {
    return this.makeRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      },
      MOCK_RESPONSES.login
    );
  }

  async sendOTP(phoneNumber: string) {
    return this.makeRequest(
      '/auth/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      },
      MOCK_RESPONSES.sendOTP
    );
  }

  async verifyOTP(phoneNumber: string, otp: string, role: string) {
    if (isFeatureEnabled('SKIP_OTP_VERIFICATION') && otp.length === 6) {
      // Accept any 6-digit OTP in development
      return MOCK_RESPONSES.verifyOTP;
    }

    return this.makeRequest(
      '/auth/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp, role }),
      },
      MOCK_RESPONSES.verifyOTP
    );
  }

  async socialLogin(provider: 'google' | 'facebook', token: string, role: string) {
    // Generate provider-specific mock data
    const mockUser = {
      google: {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        role: role,
      },
      facebook: {
        id: 'facebook_' + Date.now(),
        email: 'user@facebook.com', 
        name: 'Facebook User',
        role: role,
      }
    };

    const mockResponse = {
      success: true,
      user: mockUser[provider],
      token: `mock-${provider}-jwt-token`
    };

    return this.makeRequest(
      '/auth/social-login',
      {
        method: 'POST',
        body: JSON.stringify({ provider, token, role }),
      },
      mockResponse
    );
  }

  // Chef APIs
  async getChefs() {
    const mockChefs = [
      {
        id: 1,
        name: 'Priya Sharma',
        specialty: 'North Indian Cuisine',
        rating: 4.8,
        location: 'Mumbai, 400001',
        image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      }
    ];

    return this.makeRequest('/chefs', { method: 'GET' }, mockChefs);
  }

  // Order APIs
  async getOrders(userId: string) {
    const mockOrders = [
      {
        id: 'ORD001',
        chefName: 'Priya Sharma',
        items: ['Butter Chicken (2)', 'Dal Makhani (1)'],
        total: 450,
        status: 'preparing',
      }
    ];

    return this.makeRequest(`/orders/${userId}`, { method: 'GET' }, mockOrders);
  }

  // Menu APIs
  async getMenuItems(chefId: string) {
    const mockMenuItems = [
      {
        id: 1,
        name: 'Butter Chicken',
        price: 250,
        description: 'Rich and creamy tomato-based curry',
        available: true,
      }
    ];

    return this.makeRequest(`/menu/${chefId}`, { method: 'GET' }, mockMenuItems);
  }
}

export const apiService = new ApiService();