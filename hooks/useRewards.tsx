import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isFeatureEnabled } from '@/config/featureFlags';

export interface RewardTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  orderId?: string;
  date: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  benefits: string[];
  tokenMultiplier: number;
  priorityDelivery: boolean;
  freeDelivery: boolean;
  exclusiveOffers: boolean;
}

export interface UserRewards {
  totalTokens: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentStreak: number;
  transactions: RewardTransaction[];
  subscription?: {
    planId: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
}

interface RewardsContextType {
  rewards: UserRewards;
  subscriptionPlans: SubscriptionPlan[];
  isSubscriptionEnabled: boolean;
  earnTokens: (orderId: string, orderAmount: number) => Promise<void>;
  redeemTokens: (amount: number, description: string) => Promise<boolean>;
  subscribeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  getTokensForAmount: (amount: number) => number;
  getDiscountForTokens: (tokens: number) => number;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'HomeChef Premium Monthly',
    price: 300,
    duration: 'monthly',
    benefits: [
      'Completely Ad-Free Experience',
      '3x Token Rewards',
      'Priority Delivery (30% faster)',
      'Free Delivery on all orders',
      'Exclusive Premium Offers',
      '24/7 Priority Support',
      'Early access to new chefs'
    ],
    tokenMultiplier: 3,
    priorityDelivery: true,
    freeDelivery: true,
    exclusiveOffers: true,
  },
  {
    id: 'halfyearly',
    name: 'HomeChef Premium (6 Months)',
    price: 1300,
    duration: 'halfyearly',
    benefits: [
      'Completely Ad-Free Experience',
      '4x Token Rewards',
      'Priority Delivery (30% faster)',
      'Free Delivery on all orders',
      'Exclusive Premium Offers',
      '24/7 Priority Support',
      'Early access to new chefs',
      'Save ₹500 vs monthly plan'
    ],
    tokenMultiplier: 4,
    priorityDelivery: true,
    freeDelivery: true,
    exclusiveOffers: true,
  },
  {
    id: 'yearly',
    name: 'HomeChef Premium (Annual)',
    price: 3000,
    duration: 'yearly',
    benefits: [
      'Completely Ad-Free Experience',
      '5x Token Rewards',
      'Priority Delivery (50% faster)',
      'Free Delivery on all orders',
      'Exclusive Premium Offers',
      '24/7 Priority Support',
      'Early access to new chefs',
      'Save ₹600 vs monthly plan',
      'Best Value - Most Popular!'
    ],
    tokenMultiplier: 5,
    priorityDelivery: true,
    freeDelivery: true,
    exclusiveOffers: true,
  },
];

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};

interface RewardsProviderProps {
  children: ReactNode;
}

export const RewardsProvider: React.FC<RewardsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards>({
    totalTokens: 850,
    lifetimeEarned: 1680,
    lifetimeRedeemed: 830,
    currentStreak: 5,
    transactions: [
      {
        id: '1',
        type: 'earned',
        amount: 78,
        description: 'Order #ORD001 - Butter Chicken',
        orderId: 'ORD001',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'redeemed',
        amount: 100,
        description: '₹50 discount on Order #ORD002',
        orderId: 'ORD002',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        type: 'earned',
        amount: 45,
        description: 'Order #ORD003 - Dal Makhani',
        orderId: 'ORD003',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
    subscription: undefined,
  });

  const isSubscriptionEnabled = isFeatureEnabled('ENABLE_SUBSCRIPTION_MODEL');

  // Token earning calculation: 1 token per ₹10 spent (base rate)
  const getTokensForAmount = (amount: number): number => {
    const baseTokens = Math.floor(amount / 10);
    const multiplier = rewards.subscription?.isActive 
      ? SUBSCRIPTION_PLANS.find(p => p.id === rewards.subscription?.planId)?.tokenMultiplier || 1
      : 1;
    return baseTokens * multiplier;
  };

  // Discount calculation: 2 tokens = ₹1 discount
  const getDiscountForTokens = (tokens: number): number => {
    return Math.floor(tokens / 2);
  };

  const earnTokens = async (orderId: string, orderAmount: number) => {
    if (!isFeatureEnabled('ENABLE_REWARDS_SYSTEM')) return;

    const tokensEarned = getTokensForAmount(orderAmount);
    
    const newTransaction: RewardTransaction = {
      id: Date.now().toString(),
      type: 'earned',
      amount: tokensEarned,
      description: `Order #${orderId} - ₹${orderAmount}`,
      orderId,
      date: new Date(),
    };

    setRewards(prev => ({
      ...prev,
      totalTokens: prev.totalTokens + tokensEarned,
      lifetimeEarned: prev.lifetimeEarned + tokensEarned,
      currentStreak: prev.currentStreak + 1,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const redeemTokens = async (amount: number, description: string): Promise<boolean> => {
    if (!isFeatureEnabled('ENABLE_REWARDS_SYSTEM')) return false;
    if (rewards.totalTokens < amount) return false;

    const newTransaction: RewardTransaction = {
      id: Date.now().toString(),
      type: 'redeemed',
      amount,
      description,
      date: new Date(),
    };

    setRewards(prev => ({
      ...prev,
      totalTokens: prev.totalTokens - amount,
      lifetimeRedeemed: prev.lifetimeRedeemed + amount,
      transactions: [newTransaction, ...prev.transactions],
    }));

    return true;
  };

  const subscribeToPlan = async (planId: string) => {
    if (!isSubscriptionEnabled) return;

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return;

    const startDate = new Date();
    const endDate = new Date();
    if (plan.duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    setRewards(prev => ({
      ...prev,
      subscription: {
        planId,
        startDate,
        endDate,
        isActive: true,
      },
    }));
  };

  const cancelSubscription = async () => {
    setRewards(prev => ({
      ...prev,
      subscription: prev.subscription ? {
        ...prev.subscription,
        isActive: false,
      } : undefined,
    }));
  };

  const contextValue: RewardsContextType = {
    rewards,
    subscriptionPlans: SUBSCRIPTION_PLANS,
    isSubscriptionEnabled,
    earnTokens,
    redeemTokens,
    subscribeToPlan,
    cancelSubscription,
    getTokensForAmount,
    getDiscountForTokens,
  };

  return (
    <RewardsContext.Provider value={contextValue}>
      {children}
    </RewardsContext.Provider>
  );
};