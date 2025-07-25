import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Alert } from 'react-native';
import { useToast } from '@/hooks/useToast';
import { useNotifications } from '@/hooks/useNotifications';

export type OrderStatus = 
  | 'pending_payment' 
  | 'payment_confirmed' 
  | 'sent_to_chef' 
  | 'chef_accepted' 
  | 'preparing' 
  | 'ready_for_pickup' 
  | 'delivery_assigned' 
  | 'picked_up' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  chefId: string;
  chefName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  placedAt: Date;
  estimatedDeliveryTime?: Date;
  deliveryAddress: {
    fullAddress: string;
    coordinates: { latitude: number; longitude: number };
  };
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  timeline: OrderTimelineEvent[];
  canCancelFree: boolean;
  cancellationPenalty: number;
  tips: {
    chefTip?: number;
    deliveryTip?: number;
  };
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  message: string;
  estimatedTime?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  rating: number;
  vehicleType: string;
  vehicleNumber: string;
  currentLocation: { latitude: number; longitude: number };
  isAvailable: boolean;
}

interface OrderManagementContextType {
  orders: Order[];
  activeOrder: Order | null;
  nearbyDeliveryPartners: DeliveryPartner[];
  placeOrder: (orderData: any) => Promise<string>;
  cancelOrder: (orderId: string, reason: string) => Promise<boolean>;
  acceptOrderAsChef: (orderId: string, estimatedTime: number) => Promise<boolean>;
  assignDeliveryPartner: (orderId: string, partnerId: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, message?: string) => Promise<boolean>;
  addTip: (orderId: string, recipientType: 'chef' | 'delivery', amount: number, message?: string) => Promise<boolean>;
  getOrderById: (orderId: string) => Order | null;
  getOrdersForChef: (chefId: string) => Order[];
  getOrdersForDeliveryPartner: (partnerId: string) => Order[];
  sendNotification: (userId: string, title: string, message: string, data?: any) => void;
  confirmOrderAfterTimer: (orderId: string) => void;
}

const OrderManagementContext = createContext<OrderManagementContextType | undefined>(undefined);

export const useOrderManagement = () => {
  const context = useContext(OrderManagementContext);
  if (context === undefined) {
    throw new Error('useOrderManagement must be used within an OrderManagementProvider');
  }
  return context;
};

interface OrderManagementProviderProps {
  children: ReactNode;
}

export const OrderManagementProvider: React.FC<OrderManagementProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { canCancelForFree, getCancellationPenalty } = useCart();
  const { showSuccess, showInfo, showError } = useToast();
  const { addNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderTimers, setOrderTimers] = useState<{[key: string]: NodeJS.Timeout}>({});
  const [nearbyDeliveryPartners, setNearbyDeliveryPartners] = useState<DeliveryPartner[]>([
    {
      id: 'dp_1',
      name: 'Rajesh Kumar',
      rating: 4.7,
      vehicleType: 'Motorcycle',
      vehicleNumber: 'MH12AB1234',
      currentLocation: { latitude: 19.0596, longitude: 72.8295 },
      isAvailable: true,
    },
    {
      id: 'dp_2',
      name: 'Amit Patel',
      rating: 4.9,
      vehicleType: 'Scooter',
      vehicleNumber: 'GJ01CD5678',
      currentLocation: { latitude: 19.0580, longitude: 72.8310 },
      isAvailable: true,
    },
  ]);

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `ORD${timestamp}${randomStr}`.toUpperCase();
  };

  const sendNotification = (userId: string, title: string, message: string, data?: any) => {
    // In a real app, this would send push notifications
    console.log(`📱 Notification to ${userId}: ${title} - ${message}`, data);
    
    // Add to notification system
    addNotification({
      type: 'order_update',
      title,
      message,
      isRead: false,
      ...data,
    });
    
    // Show toast for immediate feedback
    showInfo(title, message);
  };

  const placeOrder = async (orderData: any): Promise<string> => {
    const orderId = generateOrderId();
    const now = new Date();
    
    const newOrder: Order = {
      id: orderId,
      customerId: user?.id || '',
      customerName: user?.name || '',
      chefId: orderData.chefId,
      chefName: orderData.chefName,
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      taxes: orderData.taxes,
      total: orderData.total,
      status: 'payment_confirmed',
      placedAt: now,
      deliveryAddress: orderData.deliveryAddress,
      timeline: [
        {
          status: 'payment_confirmed',
          timestamp: now,
          message: 'Order placed and payment confirmed',
        }
      ],
      canCancelFree: canCancelForFree(now),
      cancellationPenalty: getCancellationPenalty(now),
      tips: {},
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Immediately add cancellation notification
    addNotification({
      type: 'order_update',
      title: 'Free Cancellation Available! ⏰',
      message: `Cancel order #${orderId} within 30 seconds for full refund`,
      isRead: false,
      orderId: orderId,
      actionType: 'show_cancellation_timer',
    });
    // Start 30-second timer for automatic order confirmation
    const timer = setTimeout(() => {
      sendOrderToChef(orderId);
    }, 30000);
    
    setOrderTimers(prev => ({ ...prev, [orderId]: timer }));


    return orderId;
  };

  const sendOrderToChef = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId && order.status === 'payment_confirmed') {
        const updatedOrder = {
          ...order,
          status: 'sent_to_chef' as OrderStatus,
          canCancelFree: false,
          timeline: [
            ...order.timeline,
            {
              status: 'sent_to_chef' as OrderStatus,
              timestamp: new Date(),
              message: 'Order sent to chef for confirmation',
            }
          ]
        };

        // Notify chef
        sendNotification(
          order.chefId,
          'New Order Received! 🍽️',
          `You have a new order #${order.id} worth ₹${order.total}. Please accept or decline.`,
          { orderId: order.id, orderValue: order.total }
        );

        // Notify customer
        sendNotification(
          order.customerId,
          'Order Sent to Chef',
          `Your order #${order.id} has been sent to ${order.chefName} for confirmation.`,
          { orderId: order.id }
        );

        return updatedOrder;
      }
      return order;
    }));
  };

  const cancelOrder = async (orderId: string, reason: string): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    // Clear the timer if order is cancelled
    if (orderTimers[orderId]) {
      clearTimeout(orderTimers[orderId]);
      setOrderTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[orderId];
        return newTimers;
      });
    }

    const penaltyAmount = order.canCancelFree ? 0 : order.cancellationPenalty;
    const refundAmount = order.total - penaltyAmount;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled' as OrderStatus,
          timeline: [
            ...o.timeline,
            {
              status: 'cancelled' as OrderStatus,
              timestamp: new Date(),
              message: `Order cancelled: ${reason}`,
            }
          ]
        };
      }
      return o;
    }));

    // Notify customer
    if (penaltyAmount > 0) {
      sendNotification(
        order.customerId,
        'Order Cancelled',
        `Your order has been cancelled. Penalty: ₹${penaltyAmount}. Refund: ₹${refundAmount} will be processed in 3-5 business days.`,
        { orderId, penaltyAmount, refundAmount }
      );
    } else {
      sendNotification(
        order.customerId,
        'Order Cancelled',
        `Your order has been cancelled successfully. Full refund of ₹${order.total} will be processed immediately.`,
        { orderId, refundAmount: order.total }
      );
    }

    // Notify chef if order was already sent
    if (order.status !== 'payment_confirmed') {
      sendNotification(
        order.chefId,
        'Order Cancelled',
        `Order #${orderId} has been cancelled by the customer. ${penaltyAmount > 0 ? `Compensation of ₹${penaltyAmount} will be credited to your account.` : ''}`,
        { orderId, compensationAmount: penaltyAmount }
      );
    }

    return true;
  };

  const acceptOrderAsChef = async (orderId: string, estimatedTime: number): Promise<boolean> => {
    const estimatedDeliveryTime = new Date(Date.now() + estimatedTime * 60 * 1000);

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status: 'chef_accepted' as OrderStatus,
          estimatedDeliveryTime,
          timeline: [
            ...order.timeline,
            {
              status: 'chef_accepted' as OrderStatus,
              timestamp: new Date(),
              message: `Chef accepted order. Estimated delivery: ${estimatedTime} minutes`,
              estimatedTime: `${estimatedTime} minutes`,
            }
          ]
        };

        // Notify customer
        sendNotification(
          order.customerId,
          'Order Accepted! 👨‍🍳',
          `${order.chefName} has accepted your order. Estimated delivery time: ${estimatedTime} minutes.`,
          { orderId, estimatedTime, chefName: order.chefName }
        );

        // Notify nearby delivery partners
        nearbyDeliveryPartners.forEach(partner => {
          if (partner.isAvailable) {
            sendNotification(
              partner.id,
              'New Delivery Available! 🚚',
              `Pickup from ${order.chefName} to ${order.deliveryAddress.fullAddress}. Earnings: ₹85`,
              { 
                orderId, 
                pickupLocation: order.chefName,
                dropoffLocation: order.deliveryAddress.fullAddress,
                earnings: 85 
              }
            );
          }
        });

        return updatedOrder;
      }
      return order;
    }));

    return true;
  };

  const assignDeliveryPartner = async (orderId: string, partnerId: string): Promise<boolean> => {
    const partner = nearbyDeliveryPartners.find(p => p.id === partnerId);
    if (!partner) return false;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status: 'delivery_assigned' as OrderStatus,
          deliveryPartnerId: partnerId,
          deliveryPartnerName: partner.name,
          timeline: [
            ...order.timeline,
            {
              status: 'delivery_assigned' as OrderStatus,
              timestamp: new Date(),
              message: `Delivery partner ${partner.name} assigned`,
            }
          ]
        };

        // Notify customer
        sendNotification(
          order.customerId,
          'Delivery Partner Assigned! 🚚',
          `${partner.name} will deliver your order. Vehicle: ${partner.vehicleType} (${partner.vehicleNumber})`,
          { orderId, partnerName: partner.name, vehicleInfo: `${partner.vehicleType} (${partner.vehicleNumber})` }
        );

        // Notify chef
        sendNotification(
          order.chefId,
          'Delivery Partner Assigned',
          `${partner.name} will pick up order #${orderId} once it's ready.`,
          { orderId, partnerName: partner.name }
        );

        // Notify delivery partner
        sendNotification(
          partnerId,
          'Delivery Accepted! 📦',
          `You've been assigned order #${orderId}. Please coordinate with ${order.chefName} for pickup.`,
          { orderId, chefName: order.chefName }
        );

        return updatedOrder;
      }
      return order;
    }));

    return true;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, message?: string): Promise<boolean> => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status,
          timeline: [
            ...order.timeline,
            {
              status,
              timestamp: new Date(),
              message: message || getDefaultStatusMessage(status),
            }
          ]
        };

        // Send appropriate notifications based on status
        handleStatusNotifications(updatedOrder, status);

        return updatedOrder;
      }
      return order;
    }));

    return true;
  };

  const getDefaultStatusMessage = (status: OrderStatus): string => {
    const messages = {
      preparing: 'Chef started preparing your order',
      ready_for_pickup: 'Order is ready for pickup',
      picked_up: 'Order picked up by delivery partner',
      out_for_delivery: 'Order is out for delivery',
      delivered: 'Order delivered successfully',
    };
    return messages[status as keyof typeof messages] || `Order status updated to ${status}`;
  };

  const handleStatusNotifications = (order: Order, status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        sendNotification(
          order.customerId,
          'Order Being Prepared! 👨‍🍳',
          `${order.chefName} has started preparing your order #${order.id}.`,
          { orderId: order.id }
        );
        break;

      case 'ready_for_pickup':
        sendNotification(
          order.customerId,
          'Order Ready! 🍽️',
          `Your order is ready for pickup. Delivery partner will collect it soon.`,
          { orderId: order.id }
        );
        if (order.deliveryPartnerId) {
          sendNotification(
            order.deliveryPartnerId,
            'Order Ready for Pickup! 📦',
            `Order #${order.id} is ready for pickup from ${order.chefName}.`,
            { orderId: order.id, chefName: order.chefName }
          );
        }
        break;

      case 'picked_up':
        sendNotification(
          order.customerId,
          'Order Picked Up! 🚚',
          `${order.deliveryPartnerName} has picked up your order and is on the way.`,
          { orderId: order.id, partnerName: order.deliveryPartnerName }
        );
        break;

      case 'out_for_delivery':
        sendNotification(
          order.customerId,
          'Out for Delivery! 🛵',
          `Your order is on the way! Expected delivery in 15-20 minutes.`,
          { orderId: order.id }
        );
        break;

      case 'delivered':
        sendNotification(
          order.customerId,
          'Order Delivered! 🎉',
          `Your order has been delivered successfully. Enjoy your meal! Don't forget to rate and tip.`,
          { orderId: order.id, canRate: true, canTip: true }
        );
        sendNotification(
          order.chefId,
          'Order Completed! ✅',
          `Order #${order.id} has been delivered successfully. Great job!`,
          { orderId: order.id }
        );
        if (order.deliveryPartnerId) {
          sendNotification(
            order.deliveryPartnerId,
            'Delivery Completed! 🎯',
            `Order #${order.id} delivered successfully. Earnings will be credited to your account.`,
            { orderId: order.id }
          );
        }
      console.error('Order placement error:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  // Expose sendOrderToChef for external use
  const confirmOrderAfterTimer = (orderId: string) => {
    sendOrderToChef(orderId);
  };

  const addTip = async (orderId: string, recipientType: 'chef' | 'delivery', amount: number, message?: string): Promise<boolean> => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          tips: {
            ...order.tips,
            [recipientType === 'chef' ? 'chefTip' : 'deliveryTip']: amount,
          }
        };

        // Notify recipient
        const recipientId = recipientType === 'chef' ? order.chefId : order.deliveryPartnerId;
        const recipientName = recipientType === 'chef' ? order.chefName : order.deliveryPartnerName;
        
        if (recipientId && recipientName) {
          sendNotification(
            recipientId,
            'Tip Received! 💝',
            `You received a tip of ₹${amount} from ${order.customerName}${message ? `: "${message}"` : ''}`,
            { orderId, tipAmount: amount, message }
          );
        }

        // Notify customer
        sendNotification(
          order.customerId,
          'Tip Sent Successfully! 💝',
          `Your tip of ₹${amount} has been sent to ${recipientName}. Thank you for your generosity!`,
          { orderId, tipAmount: amount, recipientName }
        );

        return updatedOrder;
      }
      return order;
    }));

    return true;
  };

  const getOrderById = (orderId: string): Order | null => {
    return orders.find(order => order.id === orderId) || null;
  };

  const getOrdersForChef = (chefId: string): Order[] => {
    return orders.filter(order => order.chefId === chefId);
  };

  const getOrdersForDeliveryPartner = (partnerId: string): Order[] => {
    return orders.filter(order => order.deliveryPartnerId === partnerId);
  };

  const contextValue: OrderManagementContextType = {
    orders,
    activeOrder,
    nearbyDeliveryPartners,
    placeOrder,
    cancelOrder,
    acceptOrderAsChef,
    assignDeliveryPartner,
    updateOrderStatus,
    addTip,
    getOrderById,
    getOrdersForChef,
    getOrdersForDeliveryPartner,
    sendNotification,
    confirmOrderAfterTimer,
  };

  return (
    <OrderManagementContext.Provider value={contextValue}>
      {children}
    </OrderManagementContext.Provider>
  );
};