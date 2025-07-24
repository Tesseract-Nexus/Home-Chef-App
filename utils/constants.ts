// App-wide constants matching Uber Eats design system
export const COLORS = {
  primary: '#000000',
  primaryLight: '#F6F6F6',
  primaryDark: '#000000',
  
  secondary: '#EEEEEE',
  secondaryLight: '#F6F6F6',
  secondaryDark: '#CCCCCC',
  
  success: '#057E3E',
  successLight: '#E8F5E8',
  successDark: '#046C37',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  dangerDark: '#B91C1C',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',
  
  text: {
    primary: '#000000',
    secondary: '#545454',
    tertiary: '#8E8E93',
    white: '#FFFFFF',
    disabled: '#AEAEB2',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F6F6F6',
    tertiary: '#EEEEEE',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  
  border: {
    light: '#EEEEEE',
    medium: '#D1D1D6',
    dark: '#8E8E93',
  },
  
  // Uber Eats specific colors
  accent: '#06C167', // Green for success states
  rating: '#FFCC02', // Yellow for ratings
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 19,
  xxl: 22,
  xxxl: 28,
  display: 34,
};

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Uber Eats style shadows - very subtle
export const SHADOWS = {
  none: {
    elevation: 0,
    shadowOpacity: 0,
  },
  subtle: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  small: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  medium: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
};

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
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

// App configuration
export const APP_CONFIG = {
  MIN_ORDER_AMOUNT: 100,
  MAX_ORDER_AMOUNT: 5000,
  DELIVERY_RADIUS_KM: 10,
  MAX_CART_ITEMS: 20,
  SEARCH_DEBOUNCE_MS: 300,
  AUTO_LOGOUT_MINUTES: 30,
};