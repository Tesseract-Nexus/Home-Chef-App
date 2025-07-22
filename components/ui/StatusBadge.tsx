import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X, Truck } from 'lucide-react-native';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'chef' | 'delivery' | 'payment' | 'general';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'general',
  size = 'medium',
}) => {
  const getStatusConfig = () => {
    const configs = {
      order: {
        preparing: { color: '#FF6B35', icon: Clock, text: 'Preparing' },
        ready: { color: '#4CAF50', icon: CheckCircle, text: 'Ready' },
        delivering: { color: '#2196F3', icon: Truck, text: 'Delivering' },
        delivered: { color: '#4CAF50', icon: CheckCircle, text: 'Delivered' },
        cancelled: { color: '#F44336', icon: X, text: 'Cancelled' },
      },
      chef: {
        pending: { color: '#FF9800', icon: Clock, text: 'Pending' },
        approved: { color: '#4CAF50', icon: CheckCircle, text: 'Approved' },
        rejected: { color: '#F44336', icon: X, text: 'Rejected' },
        active: { color: '#4CAF50', icon: CheckCircle, text: 'Active' },
        inactive: { color: '#7F8C8D', icon: X, text: 'Inactive' },
      },
      delivery: {
        available: { color: '#4CAF50', icon: CheckCircle, text: 'Available' },
        busy: { color: '#FF9800', icon: Clock, text: 'Busy' },
        offline: { color: '#7F8C8D', icon: X, text: 'Offline' },
      },
      payment: {
        pending: { color: '#FF9800', icon: Clock, text: 'Pending' },
        completed: { color: '#4CAF50', icon: CheckCircle, text: 'Completed' },
        failed: { color: '#F44336', icon: X, text: 'Failed' },
      },
      general: {
        success: { color: '#4CAF50', icon: CheckCircle, text: 'Success' },
        warning: { color: '#FF9800', icon: AlertTriangle, text: 'Warning' },
        error: { color: '#F44336', icon: X, text: 'Error' },
        info: { color: '#2196F3', icon: Clock, text: 'Info' },
      },
    };

    return configs[type][status as keyof typeof configs[typeof type]] || 
           { color: '#7F8C8D', icon: Clock, text: status };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <View style={[
      styles.badge,
      styles[size],
      { backgroundColor: config.color }
    ]}>
      <IconComponent size={size === 'small' ? 10 : 12} color="#FFFFFF" />
      <Text style={[styles.text, styles[`${size}Text`]]}>
        {config.text.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
  },
  text: {
    color: '#FFFFFF',
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
    fontSize: 9,
  },
  mediumText: {
    fontSize: 10,
  },
});