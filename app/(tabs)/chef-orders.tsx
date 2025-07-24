import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Check, X, Phone, MessageCircle, MapPin, Star } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '@/utils/constants';

const CHEF_ORDERS = [
  {
    id: 'ORD125',
    customerName: 'Raj Patel',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    items: [
      { name: 'Butter Chicken', quantity: 2, price: 280 },
      { name: 'Dal Makhani', quantity: 1, price: 220 },
      { name: 'Naan', quantity: 4, price: 60 }
    ],
    total: 900,
    status: 'new',
    orderTime: '2:30 PM',
    estimatedTime: 30,
    address: 'Linking Road, Bandra West, Mumbai',
    phone: '+91 98765 43210',
    specialInstructions: 'Medium spice level, extra sauce on the side',
    paymentMethod: 'Online',
    deliveryType: 'own', // 'own' or 'third_party'
  },
  {
    id: 'ORD126',
    customerName: 'Anita Sharma',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    items: [
      { name: 'Paneer Tikka', quantity: 1, price: 260 },
      { name: 'Garlic Naan', quantity: 2, price: 60 }
    ],
    total: 380,
    status: 'preparing',
    orderTime: '3:15 PM',
    estimatedTime: 20,
    address: 'Versova, Andheri West, Mumbai',
    phone: '+91 98765 43211',
    specialInstructions: 'Less spicy please',
    paymentMethod: 'Cash on Delivery',
    deliveryType: 'third_party',
  },
  {
    id: 'ORD127',
    customerName: 'Vikram Singh',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    items: [
      { name: 'Biryani', quantity: 1, price: 350 }
    ],
    total: 350,
    status: 'ready',
    orderTime: '1:45 PM',
    estimatedTime: 0,
    address: 'Powai, Mumbai',
    phone: '+91 98765 43212',
    specialInstructions: '',
    paymentMethod: 'Online',
    deliveryType: 'own',
  },
];

const ORDER_STATUS_CONFIG = {
  new: { color: '#000000', text: 'New Order', icon: Clock },
  preparing: { color: '#000000', text: 'Preparing', icon: Clock },
  ready: { color: '#06C167', text: 'Ready', icon: Check },
  completed: { color: '#06C167', text: 'Completed', icon: Check },
  cancelled: { color: '#8E8E93', text: 'Cancelled', icon: X },
};

export default function ChefOrders() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [orders, setOrders] = useState(CHEF_ORDERS);

  const activeOrders = orders.filter(order => ['new', 'preparing', 'ready'].includes(order.status));
  const completedOrders = orders.filter(order => ['completed', 'cancelled'].includes(order.status));

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => updateOrderStatus(orderId, 'preparing')
        }
      ]
    );
  };

  const handleRejectOrder = (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => updateOrderStatus(orderId, 'cancelled')
        }
      ]
    );
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    Alert.alert('Order Ready!', 'Customer and delivery partner have been notified.');
  };

  const renderOrderCard = (order: typeof CHEF_ORDERS[0]) => {
    const statusConfig = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{order.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </View>
        </View>

        <Text style={styles.customerName}>{order.customerName}</Text>
        <Text style={styles.orderTime}>{order.orderTime}</Text>

        <View style={styles.itemsSection}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>×{item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>₹{order.total}</Text>
          <Text style={styles.estimatedTime}>{order.estimatedTime > 0 ? `${order.estimatedTime} min` : 'Ready'}</Text>
        </View>

        <View style={styles.actionButtons}>
          {order.status === 'new' && (
            <>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => handleRejectOrder(order.id)}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(order.id)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}
          
          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={styles.readyButton}
              onPress={() => handleMarkReady(order.id)}
            >
              <Text style={styles.readyButtonText}>Mark as Ready</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'ready' && (
            <View style={styles.readyIndicator}>
              <Check size={16} color="#06C167" />
              <Text style={styles.readyIndicatorText}>Waiting for Pickup</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabSection}>
        <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.ordersList}>
        {selectedTab === 'active' ? (
          activeOrders.length > 0 ? (
            activeOrders.map(renderOrderCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active orders</Text>
              <Text style={styles.emptyStateSubtext}>New orders will appear here</Text>
            </View>
          )
        ) : (
          completedOrders.length > 0 ? (
            completedOrders.map(renderOrderCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No completed orders</Text>
              <Text style={styles.emptyStateSubtext}>Completed orders will appear here</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  tabSection: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.text.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.text.white,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  locationContainer: {
  },
  orderTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  itemsSection: {
    marginBottom: SPACING.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  itemName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  itemQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.md,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  estimatedTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  rejectButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  readyButton: {
    flex: 1,
    backgroundColor: '#06C167',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  readyButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  readyIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  readyIndicatorText: {
    color: '#06C167',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});