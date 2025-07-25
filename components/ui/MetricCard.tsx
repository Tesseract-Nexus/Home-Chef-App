import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
  change?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: IconComponent,
  color,
  subtitle,
  change,
  onPress,
  size = 'medium',
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.card, styles[size]]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <IconComponent size={size === 'small' ? 20 : size === 'medium' ? 24 : 28} color={color} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, styles[`${size}Value`]]}>{value}</Text>
        <Text style={[styles.title, styles[`${size}Title`]]}>{title}</Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, styles[`${size}Subtitle`]]}>{subtitle}</Text>
        )}
        
        {change && (
          <View style={styles.changeContainer}>
            {change.startsWith('+') ? (
              <TrendingUp size={12} color={COLORS.success} />
            ) : (
              <TrendingDown size={12} color={COLORS.danger} />
            )}
            <Text style={[
              styles.change,
              { color: change.startsWith('+') ? COLORS.success : COLORS.danger }
            ]}>
              {change}
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  
  // Sizes
  small: {
    padding: SPACING.md,
  },
  medium: {
    padding: SPACING.lg,
  },
  large: {
    padding: SPACING.xl,
  },
  
  // Value styles
  value: {
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  smallValue: {
    fontSize: FONT_SIZES.lg,
  },
  mediumValue: {
    fontSize: FONT_SIZES.xl,
  },
  largeValue: {
    fontSize: FONT_SIZES.xxl,
  },
  
  // Title styles
  title: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  smallTitle: {
    fontSize: FONT_SIZES.xs,
  },
  mediumTitle: {
    fontSize: FONT_SIZES.sm,
  },
  largeTitle: {
    fontSize: FONT_SIZES.md,
  },
  
  // Subtitle styles
  subtitle: {
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  smallSubtitle: {
    fontSize: FONT_SIZES.xs,
  },
  mediumSubtitle: {
    fontSize: FONT_SIZES.xs,
  },
  largeSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  
  change: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});