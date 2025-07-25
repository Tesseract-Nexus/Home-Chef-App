import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  actionText?: string;
  onActionPress?: () => void;
  actionIcon?: React.ComponentType<any>;
  showChevron?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  actionText,
  onActionPress,
  actionIcon: ActionIconComponent,
  showChevron = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {IconComponent && (
          <View style={styles.iconContainer}>
            <IconComponent size={20} color={COLORS.text.primary} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {(actionText || ActionIconComponent) && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          {ActionIconComponent && (
            <ActionIconComponent size={16} color={COLORS.text.white} />
          )}
          {actionText && <Text style={styles.actionText}>{actionText}</Text>}
          {showChevron && <ChevronRight size={16} color={COLORS.text.secondary} />}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 50,
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.white,
    fontWeight: '600',
  },
});