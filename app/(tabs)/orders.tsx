import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, MapPin, Phone, Star, X, MessageCircle, Truck, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useRewards } from '@/hooks/useRewards';
import { TippingModal } from '@/components/TippingModal';
import { isFeatureEnabled } from '@/config/featureFlags';
import { ReviewModal } from '@/components/ReviewModal';
import { useReviews } from '@/hooks/useReviews';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { OrderCountdownTimer } from '@/components/OrderCountdownTimer';
import { getResponsiveDimensions, getLayoutStyles } from '@/utils/responsive';

const STATUS_CONFIG = {
  payment_confirmed: { color: '#4CAF50', text: 'Payment Confirmed', icon: CheckCircle },
  sent_to_chef: { color: '#FF9800', text: 'Sent to Chef', icon: Clock },
  chef_accepted: { color: '#2196F3', text: 'Chef Accepted', icon: CheckCircle },
  preparing: { color: '#FF6B35', text: 'Preparing', icon: Clock },
  ready_for_pickup: { color: '#4CAF50', text: 'Ready for Pickup', icon: CheckCircle },
  delivery_assigned: { color: '#9C27B0', text: 'Delivery Assigned', icon: Truck },
  picked_up: { color: '#2196F3', text: 'Picked Up', icon: Truck },
  out_for_delivery: { color: '#FF6B35', text: 'Out for Delivery', icon: Truck },
  delivered: { color: '#4CAF50', text: 'Delivered', icon: CheckCircle },
  cancelled: { color: '#F44336', text: 'Cancelled', icon: X },
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCountdownTimer, setShowCountdownTimer] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTippingModal, setShowTippingModal] = useState(false);
  const [tippingRecipient, setTippingRecipient] = useState<{ type: 'chef' | 'delivery'; name: string } | null>(null);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const { earnTokens } = useRewards();
  const { canReviewOrder, getUserReviewForOrder } = useReviews();
  const { orders, cancelOrder } = useOrderManagement();
  const { isWeb, isDesktop } = getResponsiveDimensions();

  // Check for orders that need countdown timer
  useEffect(() => {
    // Only show countdown from notifications or direct triggers, not auto-show
  }, [orders, showCountdownTimer]);

  // Simulate earning tokens when order is completed
  const handleOrderCompletion = async (order: any) => {
    if (isFeatureEnabled('ENABLE_REWARDS_SYSTEM') && order.status === 'delivered') {
      await earnTokens(order.id, order.total);
    }
  };

  const handleTipSubmitted = (amount: number, message: string) => {
    console.log(`Tip of ₹${amount} sent to ${tippingRecipient?.name} with message: ${message}`);
    setShowTippingModal(false);
    setTippingRecipient(null);
  };

  const openTippingModal = (type: 'chef' | 'delivery', name: string) => {
    setTippingRecipient({ type, name });
    setShowTippingModal(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId, 'customer_request');
      Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  const renderOrderCard = (order: any) => {
    const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
    const StatusIcon = statusConfig?.icon || Clock;

    return (
      <View
        key={order.id} 
        style={styles.orderCard}
      >
        <TouchableOpacity 
          onPress={() => {
            setSelectedOrderId(order.id);
            setShowOrderTracker(true);
          }}
        >
          <View>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>#{order.id}</Text>
                <Text style={styles.orderTime}>
                  {order.placedAt.toLocaleDateString()}, {order.placedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig?.color || '#7F8C8D' }]}>
                <StatusIcon size={12} color="#FFFFFF" />
                <Text style={styles.statusText}>{statusConfig?.text || order.status}</Text>
              </View>
            </View>

            <View style={styles.chefSection}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg' }} 
                style={styles.chefAvatar}
              />
              <View style={styles.chefInfo}>
                <Text style={styles.chefName}>{order.chefName}</Text>
                <View style={styles.locationContainer}>
                  <MapPin size={12} color="#666" />
                  <Text style={styles.location}>{order.deliveryAddress.fullAddress}</Text>
                </View>
                <Text style={styles.itemCount}>{order.items.length} items • ₹{order.total}</Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.timeSection}>
                <Clock size={16} color="#FF6B35" />
                <Text style={styles.estimatedTime}>₹{order.total}</Text>
              </View>
              {(order.status === 'preparing' || order.status === 'out_for_delivery') && (
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => {
                    setSelectedOrderId(order.id);
                    setShowOrderTracker(true);
                  }}
                >
                  <Truck size={16} color="#2196F3" />
                  <Text style={styles.trackButtonText}>Track</Text>
                </TouchableOpacity>
              )}
              {order.status === 'delivered' && (
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => {
                    setSelectedOrderId(order.id);
                    setShowReviewModal(true);
                  }}
                >
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.rateButtonText}>Rate</Text>
                </TouchableOpacity>
              )}
              {order.status === 'delivered' && (
                <TouchableOpacity
                  style={styles.tipButton}
                  onPress={() => openTippingModal('chef', order.chefName)}
                >
                  <Text style={styles.tipButtonText}>💝 Tip Chef</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Cancellation Section */}
          {(order.status === 'payment_confirmed' || order.status === 'sent_to_chef' || order.status === 'chef_accepted') && (
            <View style={styles.cancellationSection}>
              {order.canCancelFree ? (
                <View style={styles.freeCancellationNotice}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.freeCancellationText}>Free cancellation available</Text>
                </View>
              ) : (
                <View style={styles.penaltyCancellationNotice}>
                  <AlertTriangle size={16} color="#FF9800" />
                  <Text style={styles.penaltyCancellationText}>
                    Cancellation penalty: ₹{order.cancellationPenalty}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const activeOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  const orderHistory = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.tabContainer, isWeb && styles.webTabContainer]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active Orders ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Order History ({orderHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={[styles.content, isWeb && styles.webContent]}
        contentContainerStyle={isWeb ? styles.webContentContainer : undefined}
      >
          <View style={[styles.ordersGrid, isWeb && styles.webOrdersGrid]}>
            {activeTab === 'active' ? (
              activeOrders.length > 0 ? (
                activeOrders.map(renderOrderCard)
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No active orders</Text>
                  <Text style={styles.emptyStateSubtext}>Your future orders will appear here</Text>
                </View>
              )
            ) : (
              orderHistory.length > 0 ? (
                orderHistory.map(renderOrderCard)
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No order history</Text>
                  <Text style={styles.emptyStateSubtext}>Start ordering to see your history</Text>
                </View>
              )
            )}
          </View>
        </ScrollView>

        {/* Order Countdown Timer */}
        {showCountdownTimer && (
          <Modal visible={!!showCountdownTimer} transparent animationType="fade">
            <OrderCountdownTimer
              orderId={showCountdownTimer}
              orderTotal={orders.find(o => o.id === showCountdownTimer)?.total || 0}
              onCancel={() => {
                setShowCountdownTimer(null);
                // Refresh orders list
              }}
              onComplete={() => {
                setShowCountdownTimer(null);
                Alert.alert(
                  'Order Confirmed! 🎉',
                  'Your order has been sent to the chef. You will be notified once the chef accepts it.',
                  [{ text: 'OK' }]
                );
              }}
            />
          </Modal>
        )}
        
        {selectedOrderId && (
          <ReviewModal
            visible={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            chefId="chef_123"
            chefName="Chef Name"
            orderId={selectedOrderId}
            dishName="Dish Name"
          />
        )}
        
        {tippingRecipient && (
          <TippingModal
            visible={showTippingModal}
            onClose={() => {
              setShowTippingModal(false);
              setTippingRecipient(null);
            }}
            recipientType={tippingRecipient.type}
            recipientName={tippingRecipient.name}
            orderId={selectedOrderId || ''}
            onTipSubmitted={handleTipSubmitted}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webContainer: {
    minHeight: '100vh',
  },
  safeArea: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  webTabContainer: {},
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  webContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  webContentContainer: {
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  orderTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  chefSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chefAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chefInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chefName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  itemCount: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  estimatedTime: {
    marginLeft: 4,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  trackButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rateButtonText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  tipButton: {
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tipButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  cancellationSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  freeCancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  freeCancellationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  penaltyCancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  penaltyCancellationText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ordersGrid: {
    // Default mobile layout
  },
  webOrdersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 16,
  },
});