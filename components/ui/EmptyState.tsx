import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent,
  title,
  subtitle,
  actionText,
  onActionPress,
  iconColor = COLORS.text.tertiary,
}) => {
  return (
    <View style={styles.container}>
      <IconComponent size={60} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {actionText && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.lg,
    borderRadius: 50,
  },
  actionText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});