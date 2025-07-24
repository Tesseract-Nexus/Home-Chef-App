import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  chefId: string;
  chefName: string;
  orderId?: string;
  dishName?: string;
  rating: number;
  reviewText: string;
  images?: string[];
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: Date;
  updatedAt?: Date;
  chefResponse?: {
    responseText: string;
    respondedAt: Date;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewsContextType {
  reviews: Review[];
  userReviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'userId' | 'userName' | 'userImage' | 'helpfulCount' | 'createdAt'>) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getReviewsByChef: (chefId: string) => Review[];
  getReviewsByOrder: (orderId: string) => Review[];
  getReviewStats: (chefId: string) => ReviewStats;
  markHelpful: (reviewId: string) => Promise<void>;
  canReviewOrder: (orderId: string) => boolean;
  getUserReviewForOrder: (orderId: string) => Review | null;
  addChefResponse: (reviewId: string, responseText: string) => Promise<void>;
  updateChefResponse: (reviewId: string, responseText: string) => Promise<void>;
  deleteChefResponse: (reviewId: string) => Promise<void>;
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Rahul Sharma',
    userImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    chefId: '1',
    chefName: 'Priya Sharma',
    orderId: 'ORD001',
    dishName: 'Butter Chicken',
    rating: 5,
    reviewText: 'Amazing butter chicken! The flavors were authentic and the delivery was quick. The chef really knows how to make traditional North Indian food. Will definitely order again!',
    helpfulCount: 12,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    chefResponse: {
      responseText: "Thank you so much for your wonderful review! I'm delighted that you enjoyed the butter chicken. Your feedback motivates me to keep cooking with love. Looking forward to serving you again soon! 🙏",
      respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Anita Patel',
    userImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    chefId: '2',
    chefName: 'Meera Patel',
    orderId: 'ORD002',
    dishName: 'Gujarati Thali',
    rating: 4,
    reviewText: 'Great Gujarati thali with authentic taste. The dal was perfectly cooked and the rotis were soft. Only wish there was a bit more variety in the vegetables.',
    helpfulCount: 8,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Vikram Singh',
    userImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    chefId: '1',
    chefName: 'Priya Sharma',
    orderId: 'ORD003',
    dishName: 'Dal Makhani',
    rating: 5,
    reviewText: 'Best dal makhani I have had in a long time! Rich, creamy, and full of flavor. The chef has mastered this dish.',
    helpfulCount: 15,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

interface ReviewsProviderProps {
  children: ReactNode;
}

export const ReviewsProvider: React.FC<ReviewsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);

  const userReviews = reviews.filter(review => review.userId === user?.id);

  const addReview = async (reviewData: Omit<Review, 'id' | 'userId' | 'userName' | 'userImage' | 'helpfulCount' | 'createdAt'>) => {
    if (!user) {
      console.warn('Cannot add review: User not authenticated');
      return;
    }

    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
      helpfulCount: 0,
      createdAt: new Date(),
    };

    setReviews(prev => [newReview, ...prev]);
  };

  const updateReview = async (reviewId: string, updates: Partial<Review>) => {
    if (!user) {
      console.warn('Cannot update review: User not authenticated');
      return;
    }
    
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, ...updates, updatedAt: new Date() }
        : review
    ));
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) {
      console.warn('Cannot delete review: User not authenticated');
      return;
    }
    
    setReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  const getReviewsByChef = (chefId: string) => {
    return reviews.filter(review => review.chefId === chefId);
  };

  const getReviewsByOrder = (orderId: string) => {
    return reviews.filter(review => review.orderId === orderId);
  };

  const getReviewStats = (chefId: string): ReviewStats => {
    const chefReviews = getReviewsByChef(chefId);
    
    if (chefReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = chefReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / chefReviews.length;

    const ratingDistribution = chefReviews.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist]++;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: chefReviews.length,
      ratingDistribution
    };
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) {
      console.warn('Cannot mark helpful: User not authenticated');
      return;
    }
    
    if (helpfulReviews.includes(reviewId)) {
      // Remove helpful mark
      setHelpfulReviews(prev => prev.filter(id => id !== reviewId));
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount - 1, isHelpful: false }
          : review
      ));
    } else {
      // Add helpful mark
      setHelpfulReviews(prev => [...prev, reviewId]);
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount + 1, isHelpful: true }
          : review
      ));
    }
  };

  const canReviewOrder = (orderId: string) => {
    if (!user) return false;
    // Check if user has already reviewed this order
    return !reviews.some(review => review.orderId === orderId && review.userId === user?.id);
  };

  const getUserReviewForOrder = (orderId: string) => {
    if (!user) return null;
    return reviews.find(review => review.orderId === orderId && review.userId === user?.id) || null;
  };

  const addChefResponse = async (reviewId: string, responseText: string) => {
    if (!user || user.role !== 'chef') {
      console.warn('Only chefs can respond to reviews');
      return;
    }

    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            chefResponse: {
              responseText: responseText.trim(),
              respondedAt: new Date(),
            },
            updatedAt: new Date()
          }
        : review
    ));
  };

  const updateChefResponse = async (reviewId: string, responseText: string) => {
    if (!user || user.role !== 'chef') {
      console.warn('Only chefs can update responses');
      return;
    }

    setReviews(prev => prev.map(review => 
      review.id === reviewId && review.chefResponse
        ? { 
            ...review, 
            chefResponse: {
              ...review.chefResponse,
              responseText: responseText.trim(),
            },
            updatedAt: new Date()
          }
        : review
    ));
  };

  const deleteChefResponse = async (reviewId: string) => {
    if (!user || user.role !== 'chef') {
      console.warn('Only chefs can delete responses');
      return;
    }

    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            chefResponse: undefined,
            updatedAt: new Date()
          }
        : review
    ));
  };

  const contextValue: ReviewsContextType = {
    reviews,
    userReviews,
    addReview,
    updateReview,
    deleteReview,
    getReviewsByChef,
    getReviewsByOrder,
    getReviewStats,
    markHelpful,
    canReviewOrder,
    getUserReviewForOrder,
    addChefResponse,
    updateChefResponse,
    deleteChefResponse,
  };

  return (
    <ReviewsContext.Provider value={contextValue}>
      {children}
    </ReviewsContext.Provider>
  );
};