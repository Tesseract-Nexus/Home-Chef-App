import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TriangleAlert as AlertTriangle, Clock, Zap } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/utils/constants';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'medium',
  showIcon = true,
}) => {
  const getPriorityConfig = () => {
    const configs = {
      low: { color: COLORS.success, icon: Clock, text: 'Low' },
      medium: { color: COLORS.warning, icon: Clock, text: 'Medium' },
      high: { color: COLORS.danger, icon: AlertTriangle, text: 'High' },
      urgent: { color: COLORS.urgent, icon: Zap, text: 'Urgent' },
      critical: { color: COLORS.text.primary, icon: Zap, text: 'Critical' },
    };
    return configs[priority];
  };

  const config = getPriorityConfig();
  const IconComponent = config.icon;

  return (
    <View style={[
      styles.container,
      styles[size],
      { backgroundColor: config.color }
    ]}>
      {showIcon && (
        <IconComponent 
          size={size === 'small' ? 10 : 12} 
          color={COLORS.text.white} 
        />
      )}
      <Text style={[styles.text, styles[`${size}Text`]]}>
        {config.text.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
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
  
  // Text sizes
  smallText: {
    fontSize: FONT_SIZES.xs,
  },
  mediumText: {
    fontSize: FONT_SIZES.xs,
  },
});