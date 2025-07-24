import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, X, Clock, CircleCheck as CheckCircle, Truck, ChefHat, Star } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/utils/constants';
import { OrderCountdownTimer } from '@/components/OrderCountdownTimer';

export interface Notification {
  id: string;
  type: 'order_update' | 'delivery' | 'chef' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
  orderId?: string;
  actionType?: 'show_cancellation_timer' | 'track_order' | 'rate_order';
}


export const NotificationBell: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [showCountdownTimer, setShowCountdownTimer] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionType === 'show_cancellation_timer' && notification.orderId) {
      setSelectedOrderId(notification.orderId);
      setShowModal(false);
      setShowCountdownTimer(true);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return ChefHat;
      case 'delivery':
        return Truck;
      case 'chef':
        return Star;
      case 'promotion':
        return Star;
      case 'system':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_update':
        return COLORS.text.primary;
      case 'delivery':
        return COLORS.text.primary;
      case 'chef':
        return COLORS.text.primary;
      case 'promotion':
        return COLORS.text.primary;
      case 'system':
        return COLORS.text.secondary;
      default:
        return COLORS.text.secondary;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = (notification: Notification) => {
    const IconComponent = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification
        ]}
        onPress={() => handleNotificationClick(notification)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: iconColor + '20' }]}>
          <IconComponent size={16} color={iconColor} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !notification.isRead && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(notification.timestamp)}
          </Text>
        </View>

        {!notification.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (!user) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => setShowModal(true)}
      >
        <Bell size={20} color={COLORS.text.primary} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={markAllAsRead}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.notificationsList}>
            {notifications.length > 0 ? (
              notifications.map(renderNotification)
            ) : (
              <View style={styles.emptyState}>
                <Bell size={48} color={COLORS.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No notifications</Text>
                <Text style={styles.emptyStateText}>
                  You'll see order updates and important messages here
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Countdown Timer Modal from Notification */}
      {showCountdownTimer && selectedOrderId && (
        <Modal visible={showCountdownTimer} transparent animationType="fade">
          <OrderCountdownTimer
            orderId={selectedOrderId}
            orderTotal={0} // Will be fetched from order
            onCancel={() => {
              setShowCountdownTimer(false);
              setSelectedOrderId(null);
            }}
            onComplete={() => {
              setShowCountdownTimer(false);
              setSelectedOrderId(null);
            }}
          />
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: BORDER_RADIUS.round,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  badgeText: {
    color: COLORS.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  markAllButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  markAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  unreadNotification: {
    backgroundColor: '#F9FAFB',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});