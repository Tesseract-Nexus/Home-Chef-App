import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Users, ShoppingBag, DollarSign, Plus, Clock, Star, Award, ChefHat, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

const CHEF_STATS = [
  { icon: TrendingUp, label: 'Today\'s Revenue', value: '₹2,450', change: '+12%' },
  { icon: ShoppingBag, label: 'Orders Today', value: '23', change: '+8%' },
  { icon: Users, label: 'Active Customers', value: '156', change: '+15%' },
  { icon: Clock, label: 'Avg. Prep Time', value: '28 min', change: '-5%' },
];

const RECENT_ORDERS = [
  { id: 'ORD125', customer: 'Raj Patel', items: 'Butter Chicken x2', amount: '₹560', status: 'preparing' },
  { id: 'ORD124', customer: 'Anita Sharma', items: 'Dal Makhani + Naan', amount: '₹280', status: 'ready' },
  { id: 'ORD123', customer: 'Vikram Singh', items: 'Paneer Curry + Rice', amount: '₹340', status: 'new' },
];

const MENU_HIGHLIGHTS = [
  { 
    id: '1', 
    name: 'Butter Chicken', 
    price: 280, 
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    available: true,
    orders: 45
  },
  { 
    id: '2', 
    name: 'Dal Makhani', 
    price: 220, 
    image: 'https://images.pexels.com/photos/5677607/pexels-photo-5677607.jpeg',
    available: true,
    orders: 32
  },
  { 
    id: '3', 
    name: 'Paneer Tikka', 
    price: 260, 
    image: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg',
    available: false,
    orders: 28
  },
];

export default function ChefHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  const renderStatCard = (stat: typeof CHEF_STATS[0], index: number) => (
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

  const renderOrderCard = (order: typeof RECENT_ORDERS[0]) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>{order.customer}</Text>
      <Text style={styles.orderItems}>{order.items}</Text>
      <Text style={styles.orderAmount}>{order.amount}</Text>
    </View>
  );

  const renderMenuCard = (item: typeof MENU_HIGHLIGHTS[0]) => (
    <View key={item.id} style={styles.menuCard}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuPrice}>₹{item.price}</Text>
        <Text style={styles.menuOrders}>{item.orders} orders this week</Text>
        <View style={styles.menuStatus}>
          {item.available ? (
            <View style={styles.availableStatus}>
              <Eye size={12} color="#4CAF50" />
              <Text style={styles.availableText}>Available</Text>
            </View>
          ) : (
            <View style={styles.unavailableStatus}>
              <EyeOff size={12} color="#F44336" />
              <Text style={styles.unavailableText}>Hidden</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#FF6B35';
      case 'preparing': return '#2196F3';
      case 'ready': return '#4CAF50';
      default: return '#7F8C8D';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Chef Header */}
        <View style={styles.header}>
          <View style={styles.chefInfo}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg' }} 
              style={styles.chefImage}
            />
            <View style={styles.chefDetails}>
              <Text style={styles.chefName}>Chef {user?.name || 'User'}</Text>
              <Text style={styles.chefSpecialty}>North Indian Cuisine</Text>
              <View style={styles.chefRating}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>4.8 (234 reviews)</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.onlineToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]}
              onPress={() => setIsOnline(!isOnline)}
            >
              <Text style={styles.toggleText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-menu-management' as any)}
            >
              <ChefHat size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Manage Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-orders' as any)}
            >
              <ShoppingBag size={24} color="#4CAF50" />
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-finances' as any)}
            >
              <DollarSign size={24} color="#2196F3" />
              <Text style={styles.actionText}>Finances & P/L</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-profile' as any)}
            >
              <Users size={24} color="#2196F3" />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsGrid}>
            {CHEF_STATS.map(renderStatCard)}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentOrders}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chef-orders' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersContainer}>
            {RECENT_ORDERS.map(renderOrderCard)}
          </View>
        </View>

        {/* Menu Highlights */}
        <View style={styles.menuHighlights}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Dishes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chef-menu-management' as any)}>
              <Text style={styles.viewAllText}>Manage Menu</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MENU_HIGHLIGHTS.map(renderMenuCard)}
          </ScrollView>
        </View>

        {/* Weekly Summary */}
        <View style={styles.weeklySummary}>
          <Text style={styles.sectionTitle}>This Week's Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>₹15,240</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Orders Completed</Text>
              <Text style={styles.summaryValue}>89</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer Rating</Text>
              <Text style={styles.summaryValue}>4.8 ⭐</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Repeat Customers</Text>
              <Text style={styles.summaryValue}>67%</Text>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chefInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chefImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  chefDetails: {
    flex: 1,
  },
  chefName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  chefSpecialty: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 4,
  },
  chefRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  onlineToggle: {
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    margin: '1%',
    padding: 15,
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
    fontSize: 13,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  recentOrders: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ordersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
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
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  menuHighlights: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 15,
    width: 160,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuInfo: {
    padding: 12,
  },
  menuName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 4,
  },
  menuOrders: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  menuStatus: {
    alignItems: 'flex-start',
  },
  availableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availableText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  unavailableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  unavailableText: {
    fontSize: 10,
    color: '#F44336',
    fontWeight: '600',
  },
  weeklySummary: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});