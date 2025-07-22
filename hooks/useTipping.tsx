import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface TipTransaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  toUserType: 'chef' | 'delivery';
  amount: number;
  message: string;
  orderId: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

interface TippingContextType {
  tipHistory: TipTransaction[];
  sendTip: (
    recipientId: string,
    recipientName: string,
    recipientType: 'chef' | 'delivery',
    amount: number,
    message: string,
    orderId: string
  ) => Promise<boolean>;
  getTipsReceived: (userId: string) => TipTransaction[];
  getTipsSent: (userId: string) => TipTransaction[];
  getTotalTipsReceived: (userId: string, period?: 'today' | 'week' | 'month') => number;
}

const TippingContext = createContext<TippingContextType | undefined>(undefined);

export const useTipping = () => {
  const context = useContext(TippingContext);
  if (context === undefined) {
    throw new Error('useTipping must be used within a TippingProvider');
  }
  return context;
};

interface TippingProviderProps {
  children: ReactNode;
}

export const TippingProvider: React.FC<TippingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [tipHistory, setTipHistory] = useState<TipTransaction[]>([]);

  const sendTip = async (
    recipientId: string,
    recipientName: string,
    recipientType: 'chef' | 'delivery',
    amount: number,
    message: string,
    orderId: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Simulate payment processing with direct bank transfer
      const newTip: TipTransaction = {
        id: Date.now().toString(),
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId: recipientId,
        toUserName: recipientName,
        toUserType: recipientType,
        amount,
        message,
        orderId,
        timestamp: new Date(),
        status: 'pending',
      };

      setTipHistory(prev => [newTip, ...prev]);

      // Simulate direct bank transfer processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to completed
      setTipHistory(prev => prev.map(tip => 
        tip.id === newTip.id 
          ? { ...tip, status: 'completed', transactionId: `TXN${Date.now()}` }
          : tip
      ));

      // In a real implementation, this would:
      // 1. Process payment from customer's payment method
      // 2. Transfer directly to recipient's bank account
      // 3. Send notifications to both parties
      // 4. Update recipient's earnings

      return true;
    } catch (error) {
      console.error('Tip processing failed:', error);
      return false;
    }
  };

  const getTipsReceived = (userId: string) => {
    return tipHistory.filter(tip => tip.toUserId === userId && tip.status === 'completed');
  };

  const getTipsSent = (userId: string) => {
    return tipHistory.filter(tip => tip.fromUserId === userId && tip.status === 'completed');
  };

  const getTotalTipsReceived = (userId: string, period?: 'today' | 'week' | 'month') => {
    const tips = getTipsReceived(userId);
    
    if (!period) {
      return tips.reduce((total, tip) => total + tip.amount, 0);
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return tips
      .filter(tip => tip.timestamp >= startDate)
      .reduce((total, tip) => total + tip.amount, 0);
  };

  const contextValue: TippingContextType = {
    tipHistory,
    sendTip,
    getTipsReceived,
    getTipsSent,
    getTotalTipsReceived,
  };

  return (
    <TippingContext.Provider value={contextValue}>
      {children}
    </TippingContext.Provider>
  );
};