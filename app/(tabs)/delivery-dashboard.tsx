import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, DollarSign, TrendingUp, Truck, Battery, Wifi, WifiOff } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

const DELIVERY_STATS = [
  { icon: TrendingUp, label: 'Today\'s Earnings', value: '₹1,240', change: '+18%' },
  { icon: Truck, label: 'Deliveries Today', value: '12', change: '+3%' },
  { icon: Clock, label: 'Avg. Delivery Time', value: '28 min', change: '-5%' },
  { icon: DollarSign, label: 'This Week', value: '₹8,650', change: '+22%' },
];

const RECENT_DELIVERIES = [
  {
    id: 'DEL001',
    orderId: 'ORD125',
    customerName: 'Raj Patel',
    pickup: 'Priya\'s Kitchen, Bandra',
    dropoff: 'Linking Road, Bandra',
    distance: '2.3 km',
    earnings: '₹85',
    status: 'completed',
    time: '2:30 PM',
  },
  {
    id: 'DEL002',
    orderId: 'ORD126',
    customerName: 'Anita Sharma',
    pickup: 'Meera\'s Kitchen, Andheri',
    dropoff: 'Versova, Andheri',
    distance: '1.8 km',
    earnings: '₹75',
    status: 'in_progress',
    time: '3:15 PM',
  },
];

export default function DeliveryPartnerDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel] = useState(78);
  const { user } = useAuth();

  const renderStatCard = (stat: typeof DELIVERY_STATS[0], index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <stat.icon size={24} color="#FF6B35" />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
        <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#4CAF50' : '#F44336' }]}>
          {stat.change}
        </Text>
      </View>
    </View>
  );

  const renderDeliveryCard = (delivery: typeof RECENT_DELIVERIES[0]) => (
    <View key={delivery.id} style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.orderId}>#{delivery.orderId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
          <Text style={styles.statusText}>{delivery.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <Text style={styles.customerName}>{delivery.customerName}</Text>
      
      <View style={styles.locationInfo}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>Pickup: {delivery.pickup}</Text>
        </View>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.dropoffDot]} />
          <Text style={styles.locationText}>Drop: {delivery.dropoff}</Text>
        </View>
      </View>
      
      <View style={styles.deliveryFooter}>
        <Text style={styles.distance}>{delivery.distance}</Text>
        <Text style={styles.earnings}>{delivery.earnings}</Text>
        <Text style={styles.time}>{delivery.time}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF6B35';
      case 'pending': return '#2196F3';
      default: return '#7F8C8D';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Online Status */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello, {user?.name || 'Partner'}! 👋</Text>
            <Text style={styles.dateText}>Ready to deliver today?</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.onlineToggle}>
              {isOnline ? <Wifi size={20} color="#4CAF50" /> : <WifiOff size={20} color="#F44336" />}
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={isOnline ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
            <Text style={[styles.statusText, { color: isOnline ? '#4CAF50' : '#F44336' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Device Status */}
        <View style={styles.deviceStatus}>
          <View style={styles.batteryStatus}>
            <Battery size={20} color={batteryLevel > 20 ? '#4CAF50' : '#F44336'} />
            <Text style={styles.batteryText}>Battery: {batteryLevel}%</Text>
          </View>
          <View style={styles.locationStatus}>
            <MapPin size={20} color="#2196F3" />
            <Text style={styles.locationStatusText}>GPS: Active</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {DELIVERY_STATS.map(renderStatCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <MapPin size={24} color="#2196F3" />
              <Text style={styles.actionText}>View Available Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Clock size={24} color="#FF9800" />
              <Text style={styles.actionText}>Delivery History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <DollarSign size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Earnings Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Truck size={24} color="#9C27B0" />
              <Text style={styles.actionText}>Vehicle Status</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={styles.recentDeliveries}>
          <Text style={styles.sectionTitle}>Recent Deliveries</Text>
          {RECENT_DELIVERIES.map(renderDeliveryCard)}
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>This Week's Performance</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Total Deliveries</Text>
              <Text style={styles.performanceValue}>47</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Total Earnings</Text>
              <Text style={styles.performanceValue}>₹8,650</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Average Rating</Text>
              <Text style={styles.performanceValue}>4.9 ⭐</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>On-time Delivery</Text>
              <Text style={styles.performanceValue}>96%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  dateText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deviceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batteryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationStatusText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    margin: '1%',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF5F0',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statInfo: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  recentDeliveries: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  locationInfo: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  dropoffDot: {
    backgroundColor: '#F44336',
  },
  locationText: {
    fontSize: 13,
    color: '#2C3E50',
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  earnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  time: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  performanceSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});