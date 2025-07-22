// Feature flags configuration
export const FEATURE_FLAGS = {
  // API Configuration
  USE_MOCK_DATA: true, // Set to false to use real API endpoints
  
  // Authentication
  MOCK_AUTH: true, // Mock authentication responses
  SKIP_OTP_VERIFICATION: true, // Skip actual OTP verification in development
  
  // Data Sources
  MOCK_CHEFS: true, // Use mock chef data
  MOCK_ORDERS: true, // Use mock order data
  MOCK_MENU_ITEMS: true, // Use mock menu items
  
  // External Services
  MOCK_SOCIAL_LOGIN: true, // Mock Google/Facebook login
  MOCK_SMS_SERVICE: true, // Mock SMS/OTP service
  MOCK_PAYMENT: true, // Mock payment processing
  
  // Rewards & Subscription Features
  ENABLE_REWARDS_SYSTEM: true, // Enable token-based rewards
  ENABLE_SUBSCRIPTION_MODEL: false, // Enable premium subscription (default: off)
  
  // Advertisement Features
  SHOW_ADS_TO_FREE_USERS: true, // Show ads to non-subscribers (default: on)
  AD_FREQUENCY: 'medium', // 'low', 'medium', 'high' - frequency of ads
  
  // Development Features
  ENABLE_DEBUG_LOGS: true, // Show debug logs in console
  SHOW_DEV_TOOLS: true, // Show development tools/buttons
} as const;

// Environment-based overrides
if (process.env.NODE_ENV === 'production') {
  // In production, use real APIs
  Object.assign(FEATURE_FLAGS, {
    USE_MOCK_DATA: false,
    MOCK_AUTH: false,
    SKIP_OTP_VERIFICATION: false,
    MOCK_CHEFS: false,
    MOCK_ORDERS: false,
    MOCK_MENU_ITEMS: false,
    MOCK_SOCIAL_LOGIN: false,
    MOCK_SMS_SERVICE: false,
    MOCK_PAYMENT: false,
    ENABLE_DEBUG_LOGS: false,
    SHOW_DEV_TOOLS: false,
  });
}

// Helper function to check feature flags
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

// API base URLs
export const API_CONFIG = {
  MOCK_BASE_URL: 'http://localhost:3000/api',
  PRODUCTION_BASE_URL: 'https://api.homechef.com',
  get BASE_URL() {
    return isFeatureEnabled('USE_MOCK_DATA') 
      ? this.MOCK_BASE_URL 
      : this.PRODUCTION_BASE_URL;
  }
};

// Platform fee configuration
export const PLATFORM_CONFIG = {
  CHEF_COMMISSION_RATE: 0.15, // 15% platform fee from chef earnings
  DELIVERY_COMMISSION_RATE: 0.10, // 10% platform fee from delivery earnings
  MINIMUM_ORDER_FOR_FEE: 100, // Minimum order value to charge platform fee
  FEE_CALCULATION_METHOD: 'order_value', // 'order_value' or 'chef_earnings'
  PAYMENT_PROCESSING_FEE: 0.025, // 2.5% payment processing fee
  GST_RATE: 0.18, // 18% GST on platform fees
  
  // Order cancellation policy
  FREE_CANCELLATION_WINDOW_SECONDS: 30, // 30 seconds free cancellation
  CANCELLATION_PENALTY_RATE: 0.40, // 40% penalty after free window
  MIN_CANCELLATION_PENALTY: 20, // Minimum penalty amount in rupees
  MAX_CANCELLATION_PENALTY: 500, // Maximum penalty amount in rupees
};