import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { PLATFORM_CONFIG } from '@/config/featureFlags';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  spiceLevel: 'mild' | 'medium' | 'hot';
  preparationTime: number; // in minutes
  available: boolean;
  rating: number;
  reviewCount: number;
  ingredients?: string[];
  allergens?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  customizations?: string[];
}

export interface Chef {
  id: string;
  name: string;
  image: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  menu: MenuItem[];
}

interface CartContextType {
  cartItems: CartItem[];
  currentChef: Chef | null;
  cartTotal: number;
  itemCount: number;
  addToCart: (chef: Chef, menuItem: MenuItem, quantity: number, specialInstructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getDeliveryFee: () => number;
  getTaxes: () => number;
  getFinalTotal: () => number;
  canAddFromDifferentChef: (chefId: string) => boolean;
  getPlatformFee: () => number;
  getChefEarnings: () => number;
  getOrderBreakdown: () => OrderBreakdown;
  getCancellationPenalty: (orderPlacedAt: Date) => number;
  canCancelForFree: (orderPlacedAt: Date) => boolean;
}

export interface OrderBreakdown {
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  platformFee: number;
  chefEarnings: number;
  customerTotal: number;
}

const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Butter Chicken',
    description: 'Rich and creamy tomato-based curry with tender chicken pieces, served with aromatic basmati rice',
    price: 280,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Main Course',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 25,
    available: true,
    rating: 4.8,
    reviewCount: 156,
    ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Spices'],
    allergens: ['Dairy'],
    nutritionInfo: { calories: 420, protein: 28, carbs: 12, fat: 32 }
  },
  {
    id: '2',
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked with butter, cream and aromatic spices',
    price: 220,
    image: 'https://images.pexels.com/photos/5677607/pexels-photo-5677607.jpeg',
    category: 'Main Course',
    isVeg: true,
    spiceLevel: 'mild',
    preparationTime: 20,
    available: true,
    rating: 4.7,
    reviewCount: 89,
    ingredients: ['Black Lentils', 'Butter', 'Cream', 'Tomatoes', 'Spices'],
    allergens: ['Dairy'],
    nutritionInfo: { calories: 320, protein: 18, carbs: 28, fat: 18 }
  },
  {
    id: '3',
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese cubes grilled to perfection with bell peppers and onions',
    price: 260,
    image: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg',
    category: 'Appetizers',
    isVeg: true,
    spiceLevel: 'medium',
    preparationTime: 15,
    available: true,
    rating: 4.6,
    reviewCount: 67,
    ingredients: ['Paneer', 'Bell Peppers', 'Onions', 'Yogurt', 'Spices'],
    allergens: ['Dairy'],
    nutritionInfo: { calories: 280, protein: 16, carbs: 8, fat: 22 }
  },
  {
    id: '4',
    name: 'Garlic Naan',
    description: 'Soft and fluffy bread topped with fresh garlic and coriander',
    price: 60,
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
    category: 'Breads',
    isVeg: true,
    spiceLevel: 'mild',
    preparationTime: 10,
    available: true,
    rating: 4.5,
    reviewCount: 234,
    ingredients: ['Flour', 'Garlic', 'Butter', 'Coriander'],
    allergens: ['Gluten', 'Dairy'],
    nutritionInfo: { calories: 180, protein: 6, carbs: 32, fat: 4 }
  },
  {
    id: '5',
    name: 'Biryani',
    description: 'Fragrant basmati rice cooked with tender meat and aromatic spices',
    price: 350,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Rice',
    isVeg: false,
    spiceLevel: 'hot',
    preparationTime: 35,
    available: false,
    rating: 4.9,
    reviewCount: 312,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Spices', 'Fried Onions'],
    allergens: [],
    nutritionInfo: { calories: 520, protein: 32, carbs: 58, fat: 18 }
  },
  {
    id: '6',
    name: 'Masala Chai',
    description: 'Traditional Indian tea brewed with aromatic spices and milk',
    price: 40,
    image: 'https://images.pexels.com/photos/1793037/pexels-photo-1793037.jpeg',
    category: 'Beverages',
    isVeg: true,
    spiceLevel: 'mild',
    preparationTime: 5,
    available: true,
    rating: 4.4,
    reviewCount: 89,
    ingredients: ['Tea', 'Milk', 'Cardamom', 'Ginger', 'Sugar'],
    allergens: ['Dairy'],
    nutritionInfo: { calories: 80, protein: 3, carbs: 12, fat: 3 }
  }
];

const SAMPLE_CHEF: Chef = {
  id: '1',
  name: 'Priya Sharma',
  image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
  specialty: 'North Indian Cuisine',
  rating: 4.8,
  reviewCount: 234,
  location: 'Bandra West, Mumbai',
  distance: '2.3 km',
  deliveryTime: '45-60 min',
  deliveryFee: 25,
  minOrder: 200,
  isOpen: true,
  menu: SAMPLE_MENU_ITEMS
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentChef, setCurrentChef] = useState<Chef | null>(null);

  const cartTotal = cartItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (chef: Chef, menuItem: MenuItem, quantity: number, specialInstructions?: string) => {
    // Check if adding from different chef
    if (currentChef && currentChef.id !== chef.id) {
      // Clear cart when switching chefs
      setCartItems([]);
      setCurrentChef(chef);
    } else if (!currentChef) {
      setCurrentChef(chef);
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        // Update existing item with new customizations
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity, 
                specialInstructions: specialInstructions || item.specialInstructions,
                menuItem: { ...item.menuItem, ...menuItem } // Update any customizations
              }
            : item
        );
      } else {
        // Add new item to cart
        return [...prev, { menuItem, quantity, specialInstructions }];
      }
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentChef(null);
  };

  const getDeliveryFee = () => {
    if (!currentChef) return 0;
    
    // Base delivery fee
    let fee = currentChef.deliveryFee;
    
    // Add surge pricing for third-party delivery
    if (currentChef.deliveryType === 'third_party') {
      fee += 15; // Additional fee for third-party delivery
    }
    
    return fee;
  };

  const getTaxes = () => {
    return cartTotal ? Math.round(cartTotal * 0.05) : 0; // 5% tax
  };

  const getPlatformFee = () => {
    if (cartTotal < PLATFORM_CONFIG.MINIMUM_ORDER_FOR_FEE) return 0;
    return cartTotal ? Math.round(cartTotal * PLATFORM_CONFIG.CHEF_COMMISSION_RATE) : 0;
  };

  const getChefEarnings = () => {
    const platformFee = getPlatformFee();
    const paymentProcessingFee = cartTotal ? Math.round(cartTotal * PLATFORM_CONFIG.PAYMENT_PROCESSING_FEE) : 0;
    return cartTotal - platformFee - paymentProcessingFee;
  };

  const getOrderBreakdown = (): OrderBreakdown => {
    const subtotal = cartTotal;
    const deliveryFee = getDeliveryFee();
    const taxes = getTaxes();
    const platformFee = getPlatformFee();
    const chefEarnings = getChefEarnings();
    const customerTotal = subtotal + deliveryFee + taxes;

    return {
      subtotal,
      deliveryFee,
      taxes,
      platformFee,
      chefEarnings,
      customerTotal,
    };
  };

  const getFinalTotal = () => {
    return cartTotal + getDeliveryFee() + getTaxes();
  };

  const canAddFromDifferentChef = (chefId: string) => {
    return !currentChef || currentChef.id === chefId || cartItems.length === 0;
  };

  const getCancellationPenalty = (orderPlacedAt: Date): number => {
    const now = new Date();
    const timeDiff = (now.getTime() - orderPlacedAt.getTime()) / 1000; // in seconds
    
    if (timeDiff <= PLATFORM_CONFIG.FREE_CANCELLATION_WINDOW_SECONDS) {
      return 0; // Free cancellation within 30 seconds
    }
    
    const penaltyAmount = cartTotal ? cartTotal * PLATFORM_CONFIG.CANCELLATION_PENALTY_RATE : 0;
    return Math.min(
      Math.max(penaltyAmount, PLATFORM_CONFIG.MIN_CANCELLATION_PENALTY),
      PLATFORM_CONFIG.MAX_CANCELLATION_PENALTY
    );
  };

  const canCancelForFree = (orderPlacedAt: Date): boolean => {
    const now = new Date();
    const timeDiff = (now.getTime() - orderPlacedAt.getTime()) / 1000;
    return timeDiff <= PLATFORM_CONFIG.FREE_CANCELLATION_WINDOW_SECONDS;
  };
  const contextValue: CartContextType = {
    cartItems,
    currentChef,
    cartTotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getDeliveryFee,
    getTaxes,
    getFinalTotal,
    canAddFromDifferentChef,
    getPlatformFee,
    getChefEarnings,
    getOrderBreakdown,
    getCancellationPenalty,
    canCancelForFree,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Export sample data for use in components
export { SAMPLE_CHEF, SAMPLE_MENU_ITEMS };