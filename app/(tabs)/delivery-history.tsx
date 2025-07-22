import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, DollarSign, Star, Calendar, Filter } from 'lucide-react-native';

const DELIVERY_HISTORY = [
  {
    id: 'DEL001',
    orderId: 'ORD125',
    customerName: 'Raj Patel',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    chefName: 'Priya Sharma',
    pickup: 'Priya\'s Kitchen, Bandra',
    dropoff: 'Linking Road, Bandra',
    distance: '2.3 km',
    earnings: '₹85',
    rating: 5,
    deliveryTime: '28 min',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    tips: '₹20',
  },
  {
    id: 'DEL002',
    orderId: 'ORD124',
    customerName: 'Anita Sharma',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    chefName: 'Meera Patel',
    pickup: 'Meera\'s Kitchen, Andheri',
    dropoff: 'Versova, Andheri',
    distance: '1.8 km',
    earnings: '₹75',
    rating: 4,
    deliveryTime: '22 min',
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    tips: '₹0',
  },
  {
    id: 'DEL003',
    orderId: 'ORD123',
    customerName: 'Vikram Singh',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    chefName: 'Lakshmi Reddy',
    pickup: 'Lakshmi\'s Kitchen, Powai',
    dropoff: 'Hiranandani Gardens, Powai',
    distance: '1.2 km',
    earnings: '₹65',
    rating: 5,
    deliveryTime: '15 min',
    completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    tips: '₹15',
  },
];

export default function DeliveryHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [showFilters, setShowFilters] = useState(false);

  const getFilteredDeliveries = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
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

    return DELIVERY_HISTORY.filter(delivery => delivery.completedAt >= startDate);
  };

  const filteredDeliveries = getFilteredDeliveries();
  const totalEarnings = filteredDeliveries.reduce((sum, delivery) => 
    sum + parseInt(delivery.earnings.replace('₹', '')) + parseInt(delivery.tips.replace('₹', '')), 0
  );
  const avgRating = filteredDeliveries.length > 0 
    ? filteredDeliveries.reduce((sum, delivery) => sum + delivery.rating, 0) / filteredDeliveries.length 
    : 0;

  const renderDeliveryCard = (delivery: typeof DELIVERY_HISTORY[0]) => (
    <View key={delivery.id} style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{delivery.orderId}</Text>
          <Text style={styles.completedTime}>
            {delivery.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.earningsContainer}>
          <Text style={styles.earnings}>{delivery.earnings}</Text>
          {parseInt(delivery.tips.replace('₹', '')) > 0 && (
            <Text style={styles.tips}>+{delivery.tips} tip</Text>
          )}
        </View>
      </View>

      <View style={styles.customerSection}>
        <Image source={{ uri: delivery.customerImage }} style={styles.customerImage} />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{delivery.customerName}</Text>
          <Text style={styles.chefName}>Chef: {delivery.chefName}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{delivery.rating}.0</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.locationText}>{delivery.pickup}</Text>
        </View>
        <View style={styles.locationConnector} />
        <View style={styles.locationRow}>
          <View style={styles.dropoffDot} />
          <Text style={styles.locationText}>{delivery.dropoff}</Text>
        </View>
      </View>

      <View style={styles.deliveryStats}>
        <View style={styles.statItem}>
          <MapPin size={14} color="#666" />
          <Text style={styles.statText}>{delivery.distance}</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color="#666" />
          <Text style={styles.statText}>{delivery.deliveryTime}</Text>
        </View>
        <View style={styles.statItem}>
          <DollarSign size={14} color="#4CAF50" />
          <Text style={styles.totalEarning}>
            ₹{parseInt(delivery.earnings.replace('₹', '')) + parseInt(delivery.tips.replace('₹', ''))}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery History</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['today', 'week', 'month'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriodButton
            ]}
            onPress={() => setSelectedPeriod(period as typeof selectedPeriod)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.activePeriodButtonText
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{filteredDeliveries.length}</Text>
          <Text style={styles.summaryLabel}>Deliveries</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₹{totalEarnings}</Text>
          <Text style={styles.summaryLabel}>Total Earned</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{avgRating.toFixed(1)} ⭐</Text>
          <Text style={styles.summaryLabel}>Avg Rating</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map(renderDeliveryCard)
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={60} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No deliveries found</Text>
            <Text style={styles.emptyStateSubtext}>
              No deliveries completed in the selected period
            </Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#FF6B35',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deliveryCard: {
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
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  completedTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  earningsContainer: {
    alignItems: 'flex-end',
  },
  earnings: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tips: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  chefName: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  locationSection: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  dropoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 12,
  },
  locationConnector: {
    width: 2,
    height: 15,
    backgroundColor: '#E0E0E0',
    marginLeft: 3,
    marginVertical: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#2C3E50',
    flex: 1,
  },
  deliveryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  totalEarning: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});