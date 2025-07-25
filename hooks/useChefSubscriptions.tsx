import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export interface ChefSubscription {
  id: string;
  customerId: string;
  chefId: string;
  chefName: string;
  chefImage: string;
  subscribedAt: Date;
  notificationPreferences: {
    newMenuItems: boolean;
    specialOffers: boolean;
    announcements: boolean;
    priceChanges: boolean;
  };
}

export interface ChefAnnouncement {
  id: string;
  chefId: string;
  chefName: string;
  type: 'new_item' | 'special_offer' | 'announcement' | 'price_change';
  title: string;
  message: string;
  imageUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: {
    dishName?: string;
    originalPrice?: number;
    newPrice?: number;
    discountPercentage?: number;
  };
}

interface ChefSubscriptionsContextType {
  subscriptions: ChefSubscription[];
  announcements: ChefAnnouncement[];
  subscribeToChef: (chefId: string, chefName: string, chefImage: string) => Promise<void>;
  unsubscribeFromChef: (chefId: string) => Promise<void>;
  isSubscribedToChef: (chefId: string) => boolean;
  updateNotificationPreferences: (chefId: string, preferences: Partial<ChefSubscription['notificationPreferences']>) => Promise<void>;
  getSubscriptionForChef: (chefId: string) => ChefSubscription | null;
  getAnnouncementsForChef: (chefId: string) => ChefAnnouncement[];
  createAnnouncement: (announcement: Omit<ChefAnnouncement, 'id' | 'createdAt'>) => Promise<void>;
  markAnnouncementAsRead: (announcementId: string) => void;
}

const SAMPLE_ANNOUNCEMENTS: ChefAnnouncement[] = [
  {
    id: '1',
    chefId: '1',
    chefName: 'Priya Sharma',
    type: 'new_item',
    title: 'New Dish Added! 🍛',
    message: 'Try my new Hyderabadi Biryani - slow-cooked with aromatic spices and tender mutton!',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: {
      dishName: 'Hyderabadi Biryani',
    },
  },
  {
    id: '2',
    chefId: '1',
    chefName: 'Priya Sharma',
    type: 'special_offer',
    title: 'Weekend Special! 🎉',
    message: 'Get 25% off on all orders above ₹500 this weekend. Limited time offer!',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    metadata: {
      discountPercentage: 25,
    },
  },
];

const ChefSubscriptionsContext = createContext<ChefSubscriptionsContextType | undefined>(undefined);

export const useChefSubscriptions = () => {
  const context = useContext(ChefSubscriptionsContext);
  if (context === undefined) {
    throw new Error('useChefSubscriptions must be used within a ChefSubscriptionsProvider');
  }
  return context;
};

interface ChefSubscriptionsProviderProps {
  children: ReactNode;
}

export const ChefSubscriptionsProvider: React.FC<ChefSubscriptionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [subscriptions, setSubscriptions] = useState<ChefSubscription[]>([]);
  const [announcements, setAnnouncements] = useState<ChefAnnouncement[]>(SAMPLE_ANNOUNCEMENTS);

  // Sample subscription for demo
  useEffect(() => {
    if (user && user.role === 'customer' && subscriptions.length === 0) {
      const sampleSubscription: ChefSubscription = {
        id: '1',
        customerId: user.id,
        chefId: '1',
        chefName: 'Priya Sharma',
        chefImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
        subscribedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notificationPreferences: {
          newMenuItems: true,
          specialOffers: true,
          announcements: true,
          priceChanges: false,
        },
      };
      setSubscriptions([sampleSubscription]);
    }
  }, [user, subscriptions.length]);

  const subscribeToChef = async (chefId: string, chefName: string, chefImage: string) => {
    if (!user) return;

    const newSubscription: ChefSubscription = {
      id: Date.now().toString(),
      customerId: user.id,
      chefId,
      chefName,
      chefImage,
      subscribedAt: new Date(),
      notificationPreferences: {
        newMenuItems: true,
        specialOffers: true,
        announcements: true,
        priceChanges: true,
      },
    };

    setSubscriptions(prev => [...prev, newSubscription]);

    // Send welcome notification
    addNotification({
      type: 'chef',
      title: `Subscribed to ${chefName}! 🔔`,
      message: `You'll now receive notifications about new dishes, offers, and announcements from ${chefName}.`,
      isRead: false,
    });
  };

  const unsubscribeFromChef = async (chefId: string) => {
    const subscription = subscriptions.find(sub => sub.chefId === chefId);
    if (!subscription) return;

    setSubscriptions(prev => prev.filter(sub => sub.chefId !== chefId));

    addNotification({
      type: 'chef',
      title: `Unsubscribed from ${subscription.chefName}`,
      message: `You will no longer receive notifications from ${subscription.chefName}.`,
      isRead: false,
    });
  };

  const isSubscribedToChef = (chefId: string) => {
    return subscriptions.some(sub => sub.chefId === chefId);
  };

  const updateNotificationPreferences = async (
    chefId: string, 
    preferences: Partial<ChefSubscription['notificationPreferences']>
  ) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.chefId === chefId 
        ? { ...sub, notificationPreferences: { ...sub.notificationPreferences, ...preferences } }
        : sub
    ));
  };

  const getSubscriptionForChef = (chefId: string) => {
    return subscriptions.find(sub => sub.chefId === chefId) || null;
  };

  const getAnnouncementsForChef = (chefId: string) => {
    return announcements.filter(announcement => announcement.chefId === chefId);
  };

  const createAnnouncement = async (announcementData: Omit<ChefAnnouncement, 'id' | 'createdAt'>) => {
    const newAnnouncement: ChefAnnouncement = {
      ...announcementData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);

    // Notify all subscribers of this chef
    const chefSubscribers = subscriptions.filter(sub => sub.chefId === announcementData.chefId);
    
    chefSubscribers.forEach(subscription => {
      const { notificationPreferences } = subscription;
      let shouldNotify = false;

      switch (announcementData.type) {
        case 'new_item':
          shouldNotify = notificationPreferences.newMenuItems;
          break;
        case 'special_offer':
          shouldNotify = notificationPreferences.specialOffers;
          break;
        case 'announcement':
          shouldNotify = notificationPreferences.announcements;
          break;
        case 'price_change':
          shouldNotify = notificationPreferences.priceChanges;
          break;
      }

      if (shouldNotify) {
        addNotification({
          type: 'chef',
          title: `${announcementData.chefName}: ${newAnnouncement.title}`,
          message: newAnnouncement.message,
          imageUrl: newAnnouncement.imageUrl,
          isRead: false,
        });
      }
    });
  };

  const markAnnouncementAsRead = (announcementId: string) => {
    // In a real app, this would mark the announcement as read for the user
    console.log(`Marked announcement ${announcementId} as read`);
  };

  const contextValue: ChefSubscriptionsContextType = {
    subscriptions,
    announcements,
    subscribeToChef,
    unsubscribeFromChef,
    isSubscribedToChef,
    updateNotificationPreferences,
    getSubscriptionForChef,
    getAnnouncementsForChef,
    createAnnouncement,
    markAnnouncementAsRead,
  };

  return (
    <ChefSubscriptionsContext.Provider value={contextValue}>
      {children}
    </ChefSubscriptionsContext.Provider>
  );
};