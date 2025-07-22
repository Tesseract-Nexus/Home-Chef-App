import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getResponsiveDimensions, getLayoutStyles } from '@/utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
  padding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth,
  padding = true,
}) => {
  const { isWeb, isDesktop } = getResponsiveDimensions();
  const layoutStyles = getLayoutStyles();

  return (
    <View style={[
      layoutStyles.container,
      maxWidth && { maxWidth },
      padding && styles.padding,
      isWeb && styles.webContainer,
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 20,
  },
  webContainer: {
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
  },
});