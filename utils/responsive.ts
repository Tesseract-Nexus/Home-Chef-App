import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  large: 1440,
};

// Device type detection
export const getDeviceType = () => {
  if (Platform.OS === 'web') {
    if (screenWidth >= BREAKPOINTS.desktop) return 'desktop';
    if (screenWidth >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  }
  return Platform.OS;
};

// Responsive dimensions
export const getResponsiveDimensions = () => {
  const deviceType = getDeviceType();
  
  return {
    isWeb: Platform.OS === 'web',
    isMobile: deviceType === 'mobile' || Platform.OS !== 'web',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    screenWidth,
    screenHeight,
    maxWidth: deviceType === 'desktop' ? 1200 : screenWidth,
    sidebarWidth: deviceType === 'desktop' ? 280 : screenWidth * 0.8,
    cardWidth: deviceType === 'desktop' ? '48%' : '100%',
    gridColumns: deviceType === 'desktop' ? 2 : 1,
  };
};

// Responsive spacing
export const getResponsiveSpacing = () => {
  const deviceType = getDeviceType();
  
  const baseSpacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  };

  if (deviceType === 'desktop') {
    return {
      ...baseSpacing,
      lg: 20,
      xl: 24,
      xxl: 32,
    };
  }

  return baseSpacing;
};

// Responsive font sizes
export const getResponsiveFontSizes = () => {
  const deviceType = getDeviceType();
  
  const baseFontSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    display: 24,
    hero: 32,
  };

  if (deviceType === 'desktop') {
    return {
      ...baseFontSizes,
      lg: 18,
      xl: 20,
      xxl: 24,
      display: 28,
      hero: 36,
    };
  }

  return baseFontSizes;
};

// Responsive layout helpers
export const getLayoutStyles = () => {
  const { isWeb, maxWidth } = getResponsiveDimensions();
  
  return {
    container: {
      flex: 1,
      ...(isWeb && {
        maxWidth,
        alignSelf: 'center',
        width: '100%',
      }),
    },
    webContainer: isWeb ? {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    } : {},
  };
};