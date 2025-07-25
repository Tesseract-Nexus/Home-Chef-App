// App-wide constants matching Uber Eats design system
export const COLORS = {
  // Primary brand colors
  primary: '#000000',
  primaryLight: '#F6F6F6', 
  primaryDark: '#000000',
  
  // Secondary colors
  secondary: '#EEEEEE',
  secondaryLight: '#F6F6F6',
  secondaryDark: '#CCCCCC',
  
  // Status colors
  success: '#06C167',
  successLight: '#E8F5E8', 
  successDark: '#057E3E',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  
  danger: '#DC2626',
  dangerLight: '#FEE2E2', 
  dangerDark: '#B91C1C',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#545454',
    tertiary: '#8E8E93',
    white: '#FFFFFF',
    disabled: '#AEAEB2',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F6F6F6',
    tertiary: '#EEEEEE',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Border colors
  border: {
    light: '#EEEEEE',
    medium: '#D1D1D6',
    dark: '#8E8E93',
  },
  
  // Uber Eats specific colors  
  accent: '#06C167',
  rating: '#FFCC02',
  
  // Additional semantic colors
  online: '#06C167',
  offline: '#8E8E93',
  urgent: '#FF3B30',
  premium: '#FFD700',
};

// Consistent spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius scale
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

// Typography scale
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

// Font weights
export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Uber Eats style shadows
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
  large: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// App constants
export const USER_ROLES = {
  CUSTOMER: 'customer',
  CHEF: 'chef',
  ADMIN: 'admin',
  DELIVERY_PARTNER: 'delivery_partner',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

// Status types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// App configuration constants
export const APP_CONFIG = {
  MIN_ORDER_AMOUNT: 100,
  MAX_ORDER_AMOUNT: 5000,
  DELIVERY_RADIUS_KM: 10,
  MAX_CART_ITEMS: 20,
  SEARCH_DEBOUNCE_MS: 300,
  AUTO_LOGOUT_MINUTES: 30,
};

// Icon sizes for consistency
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;