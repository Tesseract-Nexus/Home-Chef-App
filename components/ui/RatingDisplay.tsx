import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  interactive?: boolean;
  onPress?: () => void;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 'medium',
  showCount = true,
  interactive = false,
  onPress,
}) => {
  const starSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  const Container = interactive ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress}>
      <Star size={starSize} color={COLORS.rating} fill={COLORS.rating} />
      <Text style={[styles.rating, styles[`${size}Rating`]]}>{rating}</Text>
      {showCount && reviewCount !== undefined && (
        <Text style={[styles.count, styles[`${size}Count`]]}>
          ({reviewCount})
        </Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  count: {
    color: COLORS.text.tertiary,
  },
  
  // Size variants
  smallRating: {
    fontSize: FONT_SIZES.sm,
  },
  mediumRating: {
    fontSize: FONT_SIZES.md,
  },
  largeRating: {
    fontSize: FONT_SIZES.lg,
  },
  
  smallCount: {
    fontSize: FONT_SIZES.xs,
  },
  mediumCount: {
    fontSize: FONT_SIZES.sm,
  },
  largeCount: {
    fontSize: FONT_SIZES.md,
  },
});