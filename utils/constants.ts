// App-wide constants
export const COLORS = {
  primary: '#FF6B35',
  primaryLight: '#FFF5F0',
  primaryDark: '#E55A2B',
  
  secondary: '#2196F3',
  secondaryLight: '#E3F2FD',
  secondaryDark: '#1976D2',
  
  success: '#4CAF50',
  successLight: '#E8F5E8',
  successDark: '#388E3C',
  
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  warningDark: '#F57C00',
  
  danger: '#F44336',
  dangerLight: '#FFEBEE',
  dangerDark: '#D32F2F',
  
  info: '#00BCD4',
  infoLight: '#E0F7FA',
  infoDark: '#0097A7',
  
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    light: '#BDC3C7',
    white: '#FFFFFF',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    light: '#FAFBFC',
  },
  
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
};

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOWS = {
  small: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medium: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  large: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
};

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  CHEF: 'chef',
  ADMIN: 'admin',
  DELIVERY_PARTNER: 'delivery_partner',
} as const;

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Chef statuses
export const CHEF_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// App configuration
export const APP_CONFIG = {
  MIN_ORDER_AMOUNT: 100,
  MAX_ORDER_AMOUNT: 5000,
  DELIVERY_RADIUS_KM: 10,
  MAX_CART_ITEMS: 20,
  SEARCH_DEBOUNCE_MS: 300,
  AUTO_LOGOUT_MINUTES: 30,
};