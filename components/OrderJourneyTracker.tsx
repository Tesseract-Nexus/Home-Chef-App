import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CircleCheck as CheckCircle, Truck, MapPin, Phone, MessageCircle, X, Star, Heart } from 'lucide-react-native';
import { useOrderManagement, Order, OrderStatus } from '@/hooks/useOrderManagement';
import { TippingModal } from '@/components/TippingModal';

interface OrderJourneyTrackerProps {
  orderId: string;
  onClose: () => void;
}

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

export const OrderJourneyTracker: React.FC<OrderJourneyTrackerProps> = ({ orderId, onClose }) => {
  const { getOrderById, cancelOrder, addTip, sendNotification } = useOrderManagement();
  const [order, setOrder] = useState<Order | null>(null);
  const [showTippingModal, setShowTippingModal] = useState(false);
  const [tippingRecipient, setTippingRecipient] = useState<{ type: 'chef' | 'delivery'; name: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const orderData = getOrderById(orderId);
    setOrder(orderData);
  }, [orderId, getOrderById]);

  const handleCancelOrder = () => {
    if (!order) return;

    const penaltyAmount = order.canCancelFree ? 0 : order.cancellationPenalty;
    const refundAmount = order.total - penaltyAmount;

    if (order.canCancelFree) {
      Alert.alert(
        'Cancel Order',
        'You can cancel this order for free since it was placed within the last 30 seconds.',
        [
          { text: 'Keep Order', style: 'cancel' },
          { 
            text: 'Cancel Order', 
            style: 'destructive',
            onPress: () => processCancellation('customer_request')
          }
        ]
      );
    } else {
      Alert.alert(
        'Cancel Order',
        `Cancelling this order will incur a penalty of ₹${penaltyAmount} (40% of order value). Refund amount: ₹${refundAmount}`,
        [
          { text: 'Keep Order', style: 'cancel' },
          { 
            text: `Cancel (₹${penaltyAmount} penalty)`, 
            style: 'destructive',
            onPress: () => processCancellation('customer_request')
          }
        ]
      );
    }
  };

  const processCancellation = async (reason: string) => {
    setCancelling(true);
    try {
      await cancelOrder(orderId, reason);
      Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleTipSubmitted = async (amount: number, message: string) => {
    if (!tippingRecipient) return;

    try {
      await addTip(orderId, tippingRecipient.type, amount, message);
      setShowTippingModal(false);
      setTippingRecipient(null);
      Alert.alert('Tip Sent!', `Your tip of ₹${amount} has been sent to ${tippingRecipient.name}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send tip. Please try again.');
    }
  };

  const openTippingModal = (type: 'chef' | 'delivery', name: string) => {
    setTippingRecipient({ type, name });
    setShowTippingModal(true);
  };

  const renderTimelineEvent = (event: any, index: number) => {
    const config = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG];
    const IconComponent = config?.icon || Clock;

    return (
      <View key={index} style={styles.timelineEvent}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineIcon, { backgroundColor: config?.color || '#7F8C8D' }]}>
            <IconComponent size={16} color="#FFFFFF" />
          </View>
          {index < order!.timeline.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{config?.text || event.status}</Text>
          <Text style={styles.timelineMessage}>{event.message}</Text>
          <Text style={styles.timelineTime}>
            {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {event.estimatedTime && (
            <Text style={styles.estimatedTime}>ETA: {event.estimatedTime}</Text>
          )}
        </View>
      </View>
    );
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const canCancel = ['payment_confirmed', 'sent_to_chef', 'chef_accepted'].includes(order.status);
  const canTipChef = ['delivered'].includes(order.status);
  const canTipDelivery = ['delivered'].includes(order.status) && order.deliveryPartnerId;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Chef:</Text>
            <Text style={styles.summaryValue}>{order.chefName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{order.items.length} items</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>₹{order.total}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[order.status]?.color || '#7F8C8D' }]}>
              <Text style={styles.statusText}>{STATUS_CONFIG[order.status]?.text || order.status}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Notice */}
        {canCancel && (
          <View style={styles.cancellationSection}>
            {order.canCancelFree ? (
              <View style={styles.freeCancellationNotice}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.freeCancellationText}>Free cancellation available</Text>
              </View>
            ) : (
              <View style={styles.penaltyCancellationNotice}>
                <Clock size={16} color="#FF9800" />
                <Text style={styles.penaltyCancellationText}>
                  Cancellation penalty: ₹{order.cancellationPenalty}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              <Text style={styles.cancelButtonText}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Information */}
        {order.deliveryPartnerId && (
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Delivery Partner</Text>
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryPartnerName}>{order.deliveryPartnerName}</Text>
              <View style={styles.deliveryActions}>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={16} color="#4CAF50" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <MessageCircle size={16} color="#2196F3" />
                  <Text style={styles.contactButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Order Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Journey</Text>
          {order.timeline.map(renderTimelineEvent)}
        </View>

        {/* Tipping Section */}
        {(canTipChef || canTipDelivery) && (
          <View style={styles.tippingSection}>
            <Text style={styles.sectionTitle}>Show Your Appreciation 💝</Text>
            <Text style={styles.tippingSubtitle}>Tips go directly to their bank account</Text>
            
            <View style={styles.tippingButtons}>
              {canTipChef && !order.tips.chefTip && (
                <TouchableOpacity 
                  style={styles.tipButton}
                  onPress={() => openTippingModal('chef', order.chefName)}
                >
                  <Heart size={16} color="#FF6B35" />
                  <Text style={styles.tipButtonText}>Tip Chef</Text>
                </TouchableOpacity>
              )}
              
              {canTipDelivery && !order.tips.deliveryTip && (
                <TouchableOpacity 
                  style={styles.tipButton}
                  onPress={() => openTippingModal('delivery', order.deliveryPartnerName || '')}
                >
                  <Truck size={16} color="#2196F3" />
                  <Text style={styles.tipButtonText}>Tip Delivery Partner</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Show existing tips */}
            {(order.tips.chefTip || order.tips.deliveryTip) && (
              <View style={styles.existingTips}>
                <Text style={styles.existingTipsTitle}>Tips Sent:</Text>
                {order.tips.chefTip && (
                  <Text style={styles.tipSent}>Chef: ₹{order.tips.chefTip} ✅</Text>
                )}
                {order.tips.deliveryTip && (
                  <Text style={styles.tipSent}>Delivery: ₹{order.tips.deliveryTip} ✅</Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Tipping Modal */}
      {tippingRecipient && (
        <TippingModal
          visible={showTippingModal}
          onClose={() => {
            setShowTippingModal(false);
            setTippingRecipient(null);
          }}
          recipientType={tippingRecipient.type}
          recipientName={tippingRecipient.name}
          orderId={orderId}
          onTipSubmitted={handleTipSubmitted}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancellationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  freeCancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  freeCancellationText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  penaltyCancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  penaltyCancellationText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deliverySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryPartnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  deliveryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  contactButtonText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  timelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  timelineMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 2,
  },
  tippingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tippingSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  tippingButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 6,
  },
  tipButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  existingTips: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
  },
  existingTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  tipSent: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
});