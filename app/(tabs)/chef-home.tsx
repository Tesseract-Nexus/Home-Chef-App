import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Users, ShoppingBag, DollarSign, Star, ChefHat, Eye, EyeOff, MessageCircle, ChartBar as BarChart3 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useReviews } from '@/hooks/useReviews';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '@/utils/constants';

const CHEF_STATS = [
  { icon: DollarSign, label: 'Today\'s Revenue', value: '₹2,450', change: '+12%', color: '#06C167' },
  { icon: ShoppingBag, label: 'Orders Today', value: '23', change: '+8%', color: '#000000' },
  { icon: Users, label: 'Active Customers', value: '156', change: '+15%', color: '#000000' },
  { icon: Star, label: 'Rating', value: '4.8', change: '+0.2', color: '#FFCC02' },
];

const RECENT_ORDERS = [
  { id: 'ORD125', customer: 'Raj Patel', items: 'Butter Chicken x2', amount: '₹560', status: 'preparing', time: '2 mins ago' },
  { id: 'ORD124', customer: 'Anita Sharma', items: 'Dal Makhani + Naan', amount: '₹280', status: 'ready', time: '5 mins ago' },
  { id: 'ORD123', customer: 'Vikram Singh', items: 'Paneer Curry + Rice', amount: '₹340', status: 'delivered', time: '1 hour ago' },
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
  const { getReviewsByChef, getReviewStats } = useReviews();
  const [isOnline, setIsOnline] = useState(true);

  // Get chef's reviews and stats
  const chefReviews = getReviewsByChef('1'); // Using sample chef ID
  const reviewStats = getReviewStats('1');
  const recentReviews = chefReviews.slice(0, 3);
  const pendingResponses = chefReviews.filter(review => !review.chefResponse).length;

  const renderStatCard = (stat: typeof CHEF_STATS[0], index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color === '#000000' ? '#F6F6F6' : stat.color + '15' }]}>
        <stat.icon size={20} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#06C167' : '#EF4444' }]}>
        {stat.change}
      </Text>
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
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>{order.amount}</Text>
        <Text style={styles.orderTime}>{order.time}</Text>
      </View>
    </View>
  );

  const renderMenuCard = (item: typeof MENU_HIGHLIGHTS[0]) => (
    <View key={item.id} style={styles.menuCard}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuPrice}>₹{item.price}</Text>
        <Text style={styles.menuOrders}>{item.orders} orders</Text>
        <View style={styles.menuStatus}>
          {item.available ? (
            <View style={styles.availableStatus}>
              <Eye size={12} color="#06C167" />
              <Text style={styles.availableText}>Available</Text>
            </View>
          ) : (
            <View style={styles.unavailableStatus}>
              <EyeOff size={12} color="#8E8E93" />
              <Text style={styles.unavailableText}>Hidden</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderReviewCard = (review: any) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              color={star <= review.rating ? "#FFCC02" : "#EEEEEE"}
              fill={star <= review.rating ? "#FFCC02" : "transparent"}
            />
          ))}
        </View>
        <Text style={styles.reviewTime}>{review.createdAt.toLocaleDateString()}</Text>
      </View>
      <Text style={styles.reviewText} numberOfLines={2}>{review.reviewText}</Text>
      <Text style={styles.reviewCustomer}>- {review.userName}</Text>
      {!review.chefResponse && (
        <TouchableOpacity style={styles.respondButton}>
          <MessageCircle size={14} color="#000000" />
          <Text style={styles.respondButtonText}>Respond</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return '#000000';
      case 'ready': return '#06C167';
      case 'delivered': return '#06C167';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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
                <Star size={14} color="#FFCC02" fill="#FFCC02" />
                <Text style={styles.rating}>{reviewStats.averageRating} ({reviewStats.totalReviews} reviews)</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.onlineToggle, { backgroundColor: isOnline ? '#06C167' : '#8E8E93' }]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {CHEF_STATS.map(renderStatCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-menu-management' as any)}
            >
              <ChefHat size={24} color="#000000" />
              <Text style={styles.actionText}>Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-orders' as any)}
            >
              <ShoppingBag size={24} color="#000000" />
              <Text style={styles.actionText}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-finances' as any)}
            >
              <BarChart3 size={24} color="#000000" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/chef-profile' as any)}
            >
              <Users size={24} color="#000000" />
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chef-orders' as any)}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersContainer}>
            {RECENT_ORDERS.map(renderOrderCard)}
          </View>
        </View>

        {/* Reviews & Responses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {pendingResponses > 0 && (
            <View style={styles.pendingResponsesAlert}>
              <MessageCircle size={16} color="#FF6B35" />
              <Text style={styles.pendingResponsesText}>
                {pendingResponses} review{pendingResponses > 1 ? 's' : ''} waiting for your response
              </Text>
            </View>
          )}

          <View style={styles.reviewsContainer}>
            {recentReviews.length > 0 ? (
              recentReviews.map(renderReviewCard)
            ) : (
              <View style={styles.noReviews}>
                <Star size={32} color="#EEEEEE" />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>Start cooking to receive your first review!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Popular Dishes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Dishes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chef-menu-management' as any)}>
              <Text style={styles.viewAllText}>Manage menu</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll}>
            {MENU_HIGHLIGHTS.map(renderMenuCard)}
          </ScrollView>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  chefInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chefImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.lg,
  },
  chefDetails: {
    flex: 1,
  },
  chefName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  chefSpecialty: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  chefRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  onlineToggle: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xxl,
  },
  onlineText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  statChange: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  viewAllText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  actionText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  ordersContainer: {
    gap: SPACING.sm,
  },
  orderCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderId: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  orderItems: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  orderTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  pendingResponsesAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  pendingResponsesText: {
    fontSize: FONT_SIZES.sm,
    color: '#FF6B35',
    fontWeight: '500',
  },
  reviewsContainer: {
    gap: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  reviewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  reviewCustomer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.xxl,
    gap: SPACING.xs,
  },
  respondButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noReviewsText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  noReviewsSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  menuScroll: {
    marginLeft: -SPACING.lg,
    paddingLeft: SPACING.lg,
  },
  menuCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    width: 140,
    ...SHADOWS.subtle,
  },
  menuImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
  },
  menuInfo: {
    padding: SPACING.md,
  },
  menuName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  menuPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  menuOrders: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  menuStatus: {
    alignItems: 'flex-start',
  },
  availableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  availableText: {
    fontSize: FONT_SIZES.xs,
    color: '#06C167',
    fontWeight: '500',
  },
  unavailableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  unavailableText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});