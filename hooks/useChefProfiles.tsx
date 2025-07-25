import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export interface ChefProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  coverImage?: string;
  specialty: string;
  cuisineTypes: string[];
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  description: string;
  experience: string;
  certifications: string[];
  workingHours: {
    [key: string]: { start: string; end: string; isOpen: boolean };
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  businessInfo: {
    fssaiLicense: string;
    gstNumber?: string;
    businessType: 'individual' | 'partnership' | 'company';
  };
  stats: {
    totalOrders: number;
    repeatCustomers: number;
    avgRating: number;
    responseTime: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChefCollection {
  id: string;
  userId: string;
  chefId: string;
  chefName: string;
  chefImage: string;
  addedAt: Date;
  notificationPreferences: {
    newMenuItems: boolean;
    specialOffers: boolean;
    statusUpdates: boolean;
  };
}

export interface ChefReport {
  id: string;
  reporterId: string;
  reporterName: string;
  chefId: string;
  chefName: string;
  category: 'incorrect_info' | 'poor_quality' | 'hygiene_issues' | 'fake_reviews' | 'pricing_issues' | 'unavailable_items' | 'other';
  title: string;
  description: string;
  evidence?: {
    images: string[];
    orderIds: string[];
    additionalInfo: string;
  };
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChefHiddenList {
  id: string;
  userId: string;
  chefId: string;
  hiddenAt: Date;
  reason?: string;
}

interface ChefProfilesContextType {
  collections: ChefCollection[];
  hiddenChefs: ChefHiddenList[];
  reports: ChefReport[];
  addToCollection: (chefId: string, chefName: string, chefImage: string) => Promise<boolean>;
  removeFromCollection: (chefId: string) => Promise<boolean>;
  isInCollection: (chefId: string) => boolean;
  updateCollectionPreferences: (chefId: string, preferences: Partial<ChefCollection['notificationPreferences']>) => Promise<boolean>;
  hideChef: (chefId: string, reason?: string) => Promise<boolean>;
  unhideChef: (chefId: string) => Promise<boolean>;
  isChefHidden: (chefId: string) => boolean;
  shareChef: (chefId: string, method: 'link' | 'social' | 'message') => Promise<string>;
  reportChef: (chefId: string, category: ChefReport['category'], title: string, description: string, evidence?: ChefReport['evidence']) => Promise<boolean>;
  getChefDetails: (chefId: string) => Promise<ChefProfile | null>;
  getChefReports: (chefId: string) => ChefReport[];
  updateReportStatus: (reportId: string, status: ChefReport['status'], resolution?: string) => Promise<boolean>;
}

const SAMPLE_CHEF_PROFILES: ChefProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@homechef.com',
    phone: '+91 98765 43210',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    coverImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    specialty: 'North Indian Cuisine',
    cuisineTypes: ['north_indian', 'punjabi', 'mughlai'],
    rating: 4.8,
    reviewCount: 234,
    location: 'Bandra West, Mumbai',
    address: '123 Linking Road, Bandra West, Mumbai 400050',
    coordinates: { latitude: 19.0596, longitude: 72.8295 },
    deliveryTime: '45-60 min',
    deliveryFee: 25,
    minOrder: 200,
    isOpen: true,
    description: 'Passionate home chef specializing in authentic North Indian cuisine with 8+ years of experience. Known for rich, flavorful curries and traditional cooking methods.',
    experience: '8 years',
    certifications: ['FSSAI Certified', 'Food Safety Training', 'Hygiene Certificate'],
    workingHours: {
      monday: { start: '10:00', end: '22:00', isOpen: true },
      tuesday: { start: '10:00', end: '22:00', isOpen: true },
      wednesday: { start: '10:00', end: '22:00', isOpen: true },
      thursday: { start: '10:00', end: '22:00', isOpen: true },
      friday: { start: '10:00', end: '22:00', isOpen: true },
      saturday: { start: '10:00', end: '22:00', isOpen: true },
      sunday: { start: '12:00', end: '20:00', isOpen: true },
    },
    socialMedia: {
      instagram: '@priyaskitchen',
      facebook: 'PriyasKitchenMumbai',
    },
    businessInfo: {
      fssaiLicense: 'FSSAI12345678901234',
      gstNumber: 'GST123456789',
      businessType: 'individual',
    },
    stats: {
      totalOrders: 1247,
      repeatCustomers: 456,
      avgRating: 4.8,
      responseTime: '< 5 minutes',
    },
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(),
  },
];

const ChefProfilesContext = createContext<ChefProfilesContextType | undefined>(undefined);

export const useChefProfiles = () => {
  const context = useContext(ChefProfilesContext);
  if (context === undefined) {
    throw new Error('useChefProfiles must be used within a ChefProfilesProvider');
  }
  return context;
};

interface ChefProfilesProviderProps {
  children: ReactNode;
}

export const ChefProfilesProvider: React.FC<ChefProfilesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [collections, setCollections] = useState<ChefCollection[]>([]);
  const [hiddenChefs, setHiddenChefs] = useState<ChefHiddenList[]>([]);
  const [reports, setReports] = useState<ChefReport[]>([]);

  const addToCollection = async (chefId: string, chefName: string, chefImage: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const newCollection: ChefCollection = {
        id: `collection_${Date.now()}`,
        userId: user.id,
        chefId,
        chefName,
        chefImage,
        addedAt: new Date(),
        notificationPreferences: {
          newMenuItems: true,
          specialOffers: true,
          statusUpdates: false,
        },
      };

      setCollections(prev => [...prev, newCollection]);

      addNotification({
        type: 'chef',
        title: 'Added to Collection! 🔖',
        message: `${chefName} has been added to your collection. You'll get notified about their updates.`,
        isRead: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to add chef to collection:', error);
      return false;
    }
  };

  const removeFromCollection = async (chefId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const collection = collections.find(c => c.chefId === chefId && c.userId === user.id);
      if (!collection) return false;

      setCollections(prev => prev.filter(c => c.id !== collection.id));

      addNotification({
        type: 'chef',
        title: 'Removed from Collection',
        message: `${collection.chefName} has been removed from your collection.`,
        isRead: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to remove chef from collection:', error);
      return false;
    }
  };

  const isInCollection = (chefId: string): boolean => {
    if (!user) return false;
    return collections.some(c => c.chefId === chefId && c.userId === user.id);
  };

  const updateCollectionPreferences = async (
    chefId: string, 
    preferences: Partial<ChefCollection['notificationPreferences']>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setCollections(prev => prev.map(c => 
        c.chefId === chefId && c.userId === user.id
          ? { ...c, notificationPreferences: { ...c.notificationPreferences, ...preferences } }
          : c
      ));
      return true;
    } catch (error) {
      console.error('Failed to update collection preferences:', error);
      return false;
    }
  };

  const hideChef = async (chefId: string, reason?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const hiddenEntry: ChefHiddenList = {
        id: `hidden_${Date.now()}`,
        userId: user.id,
        chefId,
        hiddenAt: new Date(),
        reason,
      };

      setHiddenChefs(prev => [...prev, hiddenEntry]);

      addNotification({
        type: 'system',
        title: 'Chef Hidden',
        message: 'This chef has been hidden from your recommendations.',
        isRead: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to hide chef:', error);
      return false;
    }
  };

  const unhideChef = async (chefId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setHiddenChefs(prev => prev.filter(h => !(h.chefId === chefId && h.userId === user.id)));
      return true;
    } catch (error) {
      console.error('Failed to unhide chef:', error);
      return false;
    }
  };

  const isChefHidden = (chefId: string): boolean => {
    if (!user) return false;
    return hiddenChefs.some(h => h.chefId === chefId && h.userId === user.id);
  };

  const shareChef = async (chefId: string, method: 'link' | 'social' | 'message'): Promise<string> => {
    try {
      const chef = SAMPLE_CHEF_PROFILES.find(c => c.id === chefId);
      if (!chef) throw new Error('Chef not found');

      const shareUrl = `https://homechef.app/chef/${chefId}`;
      const shareText = `Check out ${chef.name} on HomeChef! Specializing in ${chef.specialty}. Rating: ${chef.rating}⭐ (${chef.reviewCount} reviews)`;

      // In a real app, this would integrate with native sharing APIs
      console.log(`Sharing chef via ${method}:`, { shareUrl, shareText });

      addNotification({
        type: 'system',
        title: 'Chef Shared! 📤',
        message: `${chef.name}'s profile has been shared successfully.`,
        isRead: false,
      });

      return shareUrl;
    } catch (error) {
      console.error('Failed to share chef:', error);
      throw error;
    }
  };

  const reportChef = async (
    chefId: string, 
    category: ChefReport['category'], 
    title: string, 
    description: string, 
    evidence?: ChefReport['evidence']
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const chef = SAMPLE_CHEF_PROFILES.find(c => c.id === chefId);
      if (!chef) return false;

      const newReport: ChefReport = {
        id: `report_${Date.now()}`,
        reporterId: user.id,
        reporterName: user.name,
        chefId,
        chefName: chef.name,
        category,
        title,
        description,
        evidence,
        status: 'pending',
        priority: category === 'hygiene_issues' ? 'critical' : 
                 category === 'poor_quality' ? 'high' : 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setReports(prev => [...prev, newReport]);

      addNotification({
        type: 'system',
        title: 'Report Submitted ✅',
        message: `Thank you for reporting. We'll review ${chef.name}'s profile and take appropriate action.`,
        isRead: false,
      });

      // Notify admin about new report
      addNotification({
        type: 'system',
        title: 'New Chef Report',
        message: `${user.name} reported ${chef.name} for: ${title}`,
        isRead: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to report chef:', error);
      return false;
    }
  };

  const getChefDetails = async (chefId: string): Promise<ChefProfile | null> => {
    try {
      // In a real app, this would make an API call
      const chef = SAMPLE_CHEF_PROFILES.find(c => c.id === chefId);
      return chef || null;
    } catch (error) {
      console.error('Failed to get chef details:', error);
      return null;
    }
  };

  const getChefReports = (chefId: string): ChefReport[] => {
    return reports.filter(r => r.chefId === chefId);
  };

  const updateReportStatus = async (reportId: string, status: ChefReport['status'], resolution?: string): Promise<boolean> => {
    try {
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, status, resolution, updatedAt: new Date() }
          : r
      ));
      return true;
    } catch (error) {
      console.error('Failed to update report status:', error);
      return false;
    }
  };

  const contextValue: ChefProfilesContextType = {
    collections,
    hiddenChefs,
    reports,
    addToCollection,
    removeFromCollection,
    isInCollection,
    updateCollectionPreferences,
    hideChef,
    unhideChef,
    isChefHidden,
    shareChef,
    reportChef,
    getChefDetails,
    getChefReports,
    updateReportStatus,
  };

  return (
    <ChefProfilesContext.Provider value={contextValue}>
      {children}
    </ChefProfilesContext.Provider>
  );
};