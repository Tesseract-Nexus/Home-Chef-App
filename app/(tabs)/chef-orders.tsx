import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CircleCheck as CheckCircle, X, Phone, MessageCircle, MapPin, Star } from 'lucide-react-native';

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
  new: { color: '#FF6B35', text: 'New Order', icon: Clock },
  preparing: { color: '#2196F3', text: 'Preparing', icon: Clock },
  ready: { color: '#4CAF50', text: 'Ready', icon: CheckCircle },
  completed: { color: '#4CAF50', text: 'Completed', icon: CheckCircle },
  cancelled: { color: '#F44336', text: 'Cancelled', icon: X },
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
    const StatusIcon = statusConfig.icon;

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <Text style={styles.orderTime}>{order.orderTime}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <StatusIcon size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Image source={{ uri: order.customerImage }} style={styles.customerImage} />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={12} color="#666" />
              <Text style={styles.address}>{order.address}</Text>
            </View>
            <Text style={styles.paymentMethod}>Payment: {order.paymentMethod}</Text>
          </View>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={16} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <MessageCircle size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Order Items:</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{order.total}</Text>
          </View>
        </View>

        {order.specialInstructions && (
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Special Instructions:</Text>
            <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
          </View>
        )}

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryTypeContainer}>
            <Text style={styles.deliveryTypeLabel}>Delivery:</Text>
            <View style={[
              styles.deliveryTypeBadge,
              { backgroundColor: order.deliveryType === 'own' ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.deliveryTypeText}>
                {order.deliveryType === 'own' ? 'Own Delivery' : 'Third Party'}
              </Text>
            </View>
          </View>
          {order.estimatedTime > 0 && (
            <Text style={styles.estimatedTime}>Est. {order.estimatedTime} min</Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          {order.status === 'new' && (
            <>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => handleRejectOrder(order.id)}
              >
                <X size={16} color="#FFFFFF" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(order.id)}
              >
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}
          
          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={styles.readyButton}
              onPress={() => handleMarkReady(order.id)}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.readyButtonText}>Mark as Ready</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'ready' && (
            <View style={styles.readyIndicator}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.readyIndicatorText}>Waiting for Pickup</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Tab Navigation */}
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
  },
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
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  customerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
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
  address: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  itemsSection: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#7F8C8D',
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  instructionsSection: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#F57C00',
    fontStyle: 'italic',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
  },
  deliveryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryTypeLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  deliveryTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryTypeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  readyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  readyIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  readyIndicatorText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
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
});