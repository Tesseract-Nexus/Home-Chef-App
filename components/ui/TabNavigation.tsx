import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  selectedTab,
  onTabChange,
  variant = 'default',
}) => {
  if (variant === 'pills') {
    return (
      <View style={styles.pillsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.pillTab,
              selectedTab === tab.id && styles.activePillTab
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <Text style={[
              styles.pillTabText,
              selectedTab === tab.id && styles.activePillTabText
            ]}>
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.defaultContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.defaultTab,
            selectedTab === tab.id && styles.activeDefaultTab
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[
            styles.defaultTabText,
            selectedTab === tab.id && styles.activeDefaultTabText
          ]}>
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Default variant
  defaultContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
  },
  defaultTab: {
    flex: 1,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeDefaultTab: {
    borderBottomColor: COLORS.text.primary,
  },
  defaultTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeDefaultTabText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  
  // Pills variant
  pillsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 4,
    margin: SPACING.lg,
  },
  pillTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePillTab: {
    backgroundColor: COLORS.text.primary,
  },
  pillTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activePillTabText: {
    color: COLORS.text.white,
  },
});