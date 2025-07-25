import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X, Info, CircleAlert as AlertCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

export interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProps {
  toast: ToastConfig;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle,
          backgroundColor: '#F0FDF4',
          borderColor: '#06C167',
          iconColor: '#06C167',
          textColor: '#166534',
        };
      case 'error':
        return {
          icon: AlertCircle,
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconColor: '#EF4444',
          textColor: '#DC2626',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconColor: '#F59E0B',
          textColor: '#D97706',
        };
      case 'info':
        return {
          icon: Info,
          backgroundColor: '#F0F9FF',
          borderColor: '#3B82F6',
          iconColor: '#3B82F6',
          textColor: '#1D4ED8',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: config.backgroundColor,
          borderLeftColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        <IconComponent size={20} color={config.iconColor} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.textColor }]}>
            {toast.title}
          </Text>
          {toast.message && (
            <Text style={[styles.message, { color: config.textColor }]}>
              {toast.message}
            </Text>
          )}
        </View>
        {toast.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toast.action.onPress}
          >
            <Text style={styles.actionText}>{toast.action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <X size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 100,
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginLeft: SPACING.md,
  },
  actionText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  closeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
});

export default Toast;