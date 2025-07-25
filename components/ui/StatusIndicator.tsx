import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X, Truck, Star } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface StatusIndicatorProps {
  status: string;
  type?: 'order' | 'chef' | 'delivery' | 'payment' | 'general';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  type = 'general',
  size = 'medium',
  showText = true,
}) => {
  const getStatusConfig = () => {
    const configs = {
      order: {
        pending: { color: COLORS.warning, icon: Clock, text: 'Pending' },
        confirmed: { color: COLORS.success, icon: CheckCircle, text: 'Confirmed' },
        preparing: { color: COLORS.primary, icon: Clock, text: 'Preparing' },
        ready: { color: COLORS.success, icon: CheckCircle, text: 'Ready' },
        delivering: { color: COLORS.info, icon: Truck, text: 'Delivering' },
        delivered: { color: COLORS.success, icon: CheckCircle, text: 'Delivered' },
        cancelled: { color: COLORS.danger, icon: X, text: 'Cancelled' },
      },
      chef: {
        pending: { color: COLORS.warning, icon: Clock, text: 'Pending' },
        approved: { color: COLORS.success, icon: CheckCircle, text: 'Approved' },
        rejected: { color: COLORS.danger, icon: X, text: 'Rejected' },
        active: { color: COLORS.success, icon: CheckCircle, text: 'Active' },
        inactive: { color: COLORS.text.secondary, icon: X, text: 'Inactive' },
      },
      delivery: {
        available: { color: COLORS.success, icon: CheckCircle, text: 'Available' },
        busy: { color: COLORS.warning, icon: Clock, text: 'Busy' },
        offline: { color: COLORS.text.secondary, icon: X, text: 'Offline' },
      },
      payment: {
        pending: { color: COLORS.warning, icon: Clock, text: 'Pending' },
        processing: { color: COLORS.info, icon: Clock, text: 'Processing' },
        completed: { color: COLORS.success, icon: CheckCircle, text: 'Completed' },
        failed: { color: COLORS.danger, icon: X, text: 'Failed' },
      },
      general: {
        success: { color: COLORS.success, icon: CheckCircle, text: 'Success' },
        warning: { color: COLORS.warning, icon: AlertTriangle, text: 'Warning' },
        error: { color: COLORS.danger, icon: X, text: 'Error' },
        info: { color: COLORS.info, icon: Clock, text: 'Info' },
      },
    };

    return configs[type][status as keyof typeof configs[typeof type]] || 
           { color: COLORS.text.secondary, icon: Clock, text: status };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <View style={[
      styles.container,
      styles[size],
      { backgroundColor: config.color }
    ]}>
      <IconComponent 
        size={size === 'small' ? 10 : size === 'medium' ? 12 : 16} 
        color={COLORS.text.white} 
      />
      {showText && (
        <Text style={[styles.text, styles[`${size}Text`]]}>
          {config.text.toUpperCase()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
  },
  text: {
    color: COLORS.text.white,
    fontWeight: '600',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  
  // Text sizes
  smallText: {
    fontSize: FONT_SIZES.xs,
  },
  mediumText: {
    fontSize: FONT_SIZES.xs,
  },
  largeText: {
    fontSize: FONT_SIZES.sm,
  },
});