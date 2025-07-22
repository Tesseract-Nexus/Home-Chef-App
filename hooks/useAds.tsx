import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRewards } from '@/hooks/useRewards';
import { isFeatureEnabled } from '@/config/featureFlags';

// Memoized ad filtering functions to prevent recalculation on every render
const filterAdsByType = (ads: AdConfig[], type: AdConfig['type'], dismissedAds: string[], userRole: string | null) => {
  return ads.filter(ad => {
    if (ad.type !== type) return false;
    if (dismissedAds.includes(ad.id)) return false;
    
    // Check if ad targets current user type
    if (!ad.targeting.userTypes.includes(userRole as any)) return false;
    
    // Check if ad is within schedule
    const now = new Date();
    if (now < ad.schedule.startDate || now > ad.schedule.endDate) return false;
    
    // Check time slots if specified
    if (ad.schedule.timeSlots) {
      const currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      const isInTimeSlot = ad.schedule.timeSlots.some(slot => {
        const [start, end] = slot.split('-');
        return currentTime >= start && currentTime <= end;
      });
      if (!isInTimeSlot) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by priority and performance
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityWeight[a.priority];
    const bPriority = priorityWeight[b.priority];
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    
    // Secondary sort by CTR (click-through rate)
    const aCTR = a.performance.impressions > 0 ? a.performance.clicks / a.performance.impressions : 0;
    const bCTR = b.performance.impressions > 0 ? b.performance.clicks / b.performance.impressions : 0;
    
    return bCTR - aCTR;
  });
};

export interface AdConfig {
  id: string;
  type: 'banner' | 'interstitial' | 'native' | 'video' | 'sponsored_content';
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  actionText: string;
  targetUrl?: string;
  restaurant?: string;
  sponsor: string;
  category: 'food' | 'restaurant' | 'delivery' | 'lifestyle' | 'tech' | 'finance';
  priority: 'low' | 'medium' | 'high';
  targeting: {
    userTypes: ('customer' | 'chef' | 'delivery')[];
    locations?: string[];
    ageGroups?: string[];
    interests?: string[];
  };
  schedule: {
    startDate: Date;
    endDate: Date;
    timeSlots?: string[];
  };
  budget: {
    totalBudget: number;
    costPerClick: number;
    costPerView: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

interface AdsContextType {
  shouldShowAds: boolean;
  bannerAds: AdConfig[];
  interstitialAds: AdConfig[];
  nativeAds: AdConfig[];
  videoAds: AdConfig[];
  sponsoredContent: AdConfig[];
  showInterstitialAd: () => AdConfig | null;
  dismissAd: (adId: string) => void;
  getAdFrequency: () => 'low' | 'medium' | 'high';
  trackAdImpression: (adId: string) => void;
  trackAdClick: (adId: string) => void;
  getTargetedAds: (type: AdConfig['type']) => AdConfig[];
  canShowAd: (lastAdTime: number) => boolean;
}

// Enhanced sample ads with better targeting and content
const SAMPLE_ADS: AdConfig[] = [
  {
    id: 'ad_1',
    type: 'banner',
    title: 'Weekend Special Offer!',
    description: 'Get 30% off on orders above ₹500 this weekend',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    actionText: 'Order Now',
    restaurant: 'Weekend Specials',
    sponsor: 'HomeChef Platform',
    category: 'food',
    priority: 'high',
    targeting: {
      userTypes: ['customer'],
      locations: ['Mumbai', 'Delhi', 'Bangalore'],
      interests: ['food', 'discounts'],
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      timeSlots: ['18:00-22:00', '12:00-14:00'],
    },
    budget: {
      totalBudget: 50000,
      costPerClick: 5,
      costPerView: 0.5,
    },
    performance: {
      impressions: 12450,
      clicks: 234,
      conversions: 45,
      revenue: 1170,
    },
  },
  {
    id: 'ad_2',
    type: 'native',
    title: 'Discover Authentic Biryani',
    description: 'Try the most loved homemade biryani from certified chefs in your area',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    actionText: 'Explore Biryani',
    restaurant: 'Biryani Masters',
    sponsor: 'Featured Chef Network',
    category: 'food',
    priority: 'medium',
    targeting: {
      userTypes: ['customer'],
      interests: ['biryani', 'indian-food', 'authentic-cuisine'],
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    budget: {
      totalBudget: 25000,
      costPerClick: 3,
      costPerView: 0.3,
    },
    performance: {
      impressions: 8900,
      clicks: 178,
      conversions: 32,
      revenue: 534,
    },
  },
  {
    id: 'ad_3',
    type: 'video',
    title: 'How to Become a HomeChef Partner',
    description: 'Join thousands of successful home chefs earning ₹30,000+ monthly',
    imageUrl: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    videoUrl: 'https://example.com/chef-onboarding-video.mp4',
    actionText: 'Start Cooking',
    sponsor: 'HomeChef Recruitment',
    category: 'lifestyle',
    priority: 'high',
    targeting: {
      userTypes: ['customer'],
      interests: ['cooking', 'entrepreneurship', 'side-income'],
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    budget: {
      totalBudget: 100000,
      costPerClick: 10,
      costPerView: 2,
    },
    performance: {
      impressions: 15600,
      clicks: 312,
      conversions: 89,
      revenue: 3120,
    },
  },
  {
    id: 'ad_4',
    type: 'sponsored_content',
    title: 'Featured: Healthy Meal Options',
    description: 'Discover nutritious, home-cooked meals perfect for your fitness goals',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    actionText: 'View Healthy Menu',
    sponsor: 'Healthy Living Partners',
    category: 'lifestyle',
    priority: 'medium',
    targeting: {
      userTypes: ['customer'],
      interests: ['health', 'fitness', 'nutrition'],
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    budget: {
      totalBudget: 75000,
      costPerClick: 8,
      costPerView: 1,
    },
    performance: {
      impressions: 9800,
      clicks: 196,
      conversions: 54,
      revenue: 1568,
    },
  },
  {
    id: 'ad_5',
    type: 'interstitial',
    title: 'Paytm Wallet Integration',
    description: 'Pay faster with Paytm wallet and get instant cashback on every order',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    actionText: 'Link Paytm Wallet',
    sponsor: 'Paytm',
    category: 'finance',
    priority: 'medium',
    targeting: {
      userTypes: ['customer'],
      interests: ['digital-payments', 'cashback'],
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    budget: {
      totalBudget: 40000,
      costPerClick: 6,
      costPerView: 0.8,
    },
    performance: {
      impressions: 6700,
      clicks: 134,
      conversions: 28,
      revenue: 804,
    },
  },
];

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const useAds = () => {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};

interface AdsProviderProps {
  children: ReactNode;
}

export const AdsProvider: React.FC<AdsProviderProps> = ({ children }) => {
  const { user, userRole } = useAuth();
  const { rewards } = useRewards();
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);
  const [adImpressions, setAdImpressions] = useState<{ [key: string]: number }>({});
  const [lastAdTime, setLastAdTime] = useState<number>(0);

  // Check if user should see ads
  const shouldShowAds = React.useMemo(() => {
    if (!isFeatureEnabled('SHOW_ADS_TO_FREE_USERS')) return false;
    
    // Don't show ads to subscribers
    if (rewards.subscription?.isActive) return false;
    
    // Don't show ads to admin users
    if (userRole === 'admin') return false;
    
    return true;
  }, [rewards.subscription?.isActive, userRole]);

  // Memoized function to get targeted ads
  const getTargetedAds = React.useCallback((type: AdConfig['type']) => {
    return filterAdsByType(SAMPLE_ADS, type, dismissedAds, userRole);
  }, [dismissedAds, userRole]);

  // Memoized ad arrays to prevent recalculation
  const bannerAds = React.useMemo(() => getTargetedAds('banner'), [getTargetedAds]);
  const interstitialAds = React.useMemo(() => getTargetedAds('interstitial'), [getTargetedAds]);
  const nativeAds = React.useMemo(() => getTargetedAds('native'), [getTargetedAds]);
  const videoAds = React.useMemo(() => getTargetedAds('video'), [getTargetedAds]);
  const sponsoredContent = React.useMemo(() => getTargetedAds('sponsored_content'), [getTargetedAds]);

  const getAdFrequency = React.useCallback((): 'low' | 'medium' | 'high' => {
    const frequency = isFeatureEnabled('AD_FREQUENCY') as string;
    return (frequency === 'low' || frequency === 'medium' || frequency === 'high') 
      ? frequency as 'low' | 'medium' | 'high'
      : 'medium';
  }, []);

  const canShowAd = React.useCallback((lastAdTime: number): boolean => {
    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;
    const frequency = getAdFrequency();
    
    // Minimum time between ads based on frequency
    const minInterval = {
      low: 5 * 60 * 1000,    // 5 minutes
      medium: 3 * 60 * 1000, // 3 minutes
      high: 1 * 60 * 1000,   // 1 minute
    };
    
    return timeSinceLastAd >= minInterval[frequency];
  }, [getAdFrequency]);

  const showInterstitialAd = React.useCallback((): AdConfig | null => {
    if (!shouldShowAds || interstitialAds.length === 0) return null;
    if (!canShowAd(lastAdTime)) return null;
    
    const frequency = getAdFrequency();
    const showProbability = {
      low: 0.15,
      medium: 0.25,
      high: 0.4,
    };

    if (Math.random() < showProbability[frequency]) {
      const ad = interstitialAds[0]; // Get highest priority ad
      setLastAdTime(Date.now());
      trackAdImpression(ad.id);
      return ad;
    }
    
    return null;
  }, [shouldShowAds, interstitialAds, canShowAd, lastAdTime, getAdFrequency]);

  const dismissAd = React.useCallback((adId: string) => {
    setDismissedAds(prev => [...prev, adId]);
    
    // Reset dismissal after 24 hours to allow ad to show again
    setTimeout(() => {
      setDismissedAds(prev => prev.filter(id => id !== adId));
    }, 24 * 60 * 60 * 1000);
  }, []);

  const trackAdImpression = (adId: string) => {
    setAdImpressions(prev => ({
      ...prev,
      [adId]: (prev[adId] || 0) + 1
    }));
    
    // In a real app, send to analytics service
    console.log(`Ad impression tracked: ${adId}`);
  };

  const trackAdClick = (adId: string) => {
    // In a real app, send to analytics service
    console.log(`Ad click tracked: ${adId}`);
  };

  const contextValue: AdsContextType = {
    shouldShowAds,
    bannerAds,
    interstitialAds,
    nativeAds,
    videoAds,
    sponsoredContent,
    showInterstitialAd,
    dismissAd,
    getAdFrequency,
    trackAdImpression,
    trackAdClick,
    getTargetedAds,
    canShowAd,
  };

  return (
    <AdsContext.Provider value={contextValue}>
      {children}
    </AdsContext.Provider>
  );
};