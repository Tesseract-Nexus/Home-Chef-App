import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/components/ui/NotificationBell';

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

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getNotificationsByType: (type: string) => Notification[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const sampleNotificationsLoaded = useRef(false);

  // Sample notifications based on user role
  useEffect(() => {
    if (!user || sampleNotificationsLoaded.current) return;

    const sampleNotifications: Notification[] = [];

    if (userRole === 'customer') {
      sampleNotifications.push(
        {
          id: '1',
          type: 'order_update',
          title: 'Order is being prepared',
          message: 'Chef Priya has started preparing your Butter Chicken order',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false,
          orderId: 'ORD125',
        },
        {
          id: '2',
          type: 'delivery',
          title: 'Order out for delivery',
          message: 'Your order is on the way! Rajesh will deliver in 15-20 minutes',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          isRead: false,
          orderId: 'ORD124',
        },
        {
          id: '3',
          type: 'promotion',
          title: 'Special offer just for you!',
          message: 'Get 25% off on your next order from your favorite chefs',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isRead: true,
        }
      );
    }

    if (sampleNotifications.length > 0) {
      setNotifications(sampleNotifications);
      sampleNotificationsLoaded.current = true;
    }
  }, [user, userRole]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(notification => notification.type === type);
  };

  const contextValue: NotificationsContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationsByType,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};