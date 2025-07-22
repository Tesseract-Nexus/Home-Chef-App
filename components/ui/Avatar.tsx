import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';

interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  showBorder?: boolean;
  borderColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
  showBorder = false,
  borderColor = '#FF6B35',
}) => {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[
      styles.avatar,
      styles[size],
      showBorder && { borderWidth: 3, borderColor },
      style,
    ]}>
      {source ? (
        <Image source={source} style={[styles.image, styles[size]]} />
      ) : (
        <View style={[styles.placeholder, styles[size]]}>
          <Text style={[styles.initials, styles[`${size}Text`]]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  image: {
    borderRadius: 50,
  },
  placeholder: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  initials: {
    color: '#7F8C8D',
    fontWeight: 'bold',
  },
  
  // Sizes
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 48,
    height: 48,
  },
  large: {
    width: 64,
    height: 64,
  },
  xlarge: {
    width: 80,
    height: 80,
  },
  
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 20,
  },
  xlargeText: {
    fontSize: 24,
  },
});