import { COLORS, FONT_SIZES, SPACING } from './constants';

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format time
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Format date
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validate pincode (Indian)
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Generate order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORD${timestamp}${randomStr}`.toUpperCase();
};

// Calculate distance between coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Get status color
export const getStatusColor = (status: string, type: 'order' | 'chef' | 'payment' = 'order'): string => {
  const statusColors = {
    order: {
      pending: COLORS.warning,
      confirmed: COLORS.info,
      preparing: COLORS.primary,
      ready: COLORS.success,
      delivering: COLORS.secondary,
      delivered: COLORS.success,
      cancelled: COLORS.danger,
    },
    chef: {
      pending: COLORS.warning,
      approved: COLORS.success,
      rejected: COLORS.danger,
      active: COLORS.success,
      inactive: COLORS.text.secondary,
    },
    payment: {
      pending: COLORS.warning,
      processing: COLORS.info,
      completed: COLORS.success,
      failed: COLORS.danger,
      refunded: COLORS.text.secondary,
    },
  };

  return statusColors[type][status as keyof typeof statusColors[typeof type]] || COLORS.text.secondary;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Generate avatar color
export const getAvatarColor = (name: string): string => {
  const colors = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.success,
    COLORS.warning,
    COLORS.info,
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if time is within business hours
export const isWithinBusinessHours = (
  time: Date = new Date(),
  startHour: number = 9,
  endHour: number = 22
): boolean => {
  const hour = time.getHours();
  return hour >= startHour && hour < endHour;
};

// Calculate delivery time estimate
export const calculateDeliveryTime = (
  distance: number,
  preparationTime: number = 30
): string => {
  const travelTime = Math.ceil(distance * 3); // 3 minutes per km
  const totalTime = preparationTime + travelTime;
  const minTime = totalTime - 5;
  const maxTime = totalTime + 10;
  
  return `${minTime}-${maxTime} min`;
};