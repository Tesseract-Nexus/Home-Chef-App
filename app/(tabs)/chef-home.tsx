import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Users, ShoppingBag, DollarSign, Star, ChefHat, Eye, EyeOff, MessageCircle, ChartBar as BarChart3, Send, X, Bell, Plus as PlusIcon } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useReviews, Review } from '@/hooks/useReviews';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS, ICON_SIZES } from '@/utils/constants';
import { useChefSubscriptions } from '@/hooks/useChefSubscriptions';

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
  const { getReviewsByChef, getReviewStats, addChefResponse, updateChefResponse } = useReviews();
  const { subscriptions, createAnnouncement } = useChefSubscriptions();
  const [isOnline, setIsOnline] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    type: 'announcement' as 'new_item' | 'special_offer' | 'announcement' | 'price_change',
    title: '',
    message: '',
    dishName: '',
    discountPercentage: '',
  });

  // Get chef's reviews and stats
  const chefReviews = getReviewsByChef('1'); // Using sample chef ID
  const reviewStats = getReviewStats('1');
  const recentReviews = chefReviews.slice(0, 3);
  const pendingResponses = chefReviews.filter(review => !review.chefResponse).length;
  const subscriberCount = subscriptions.filter(sub => sub.chefId === '1').length;

  const handleRespondToReview = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.chefResponse?.responseText || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    try {
      if (selectedReview.chefResponse) {
        await updateChefResponse(selectedReview.id, responseText.trim());
        Alert.alert('Success', 'Response updated successfully!');
      } else {
        await addChefResponse(selectedReview.id, responseText.trim());
        Alert.alert('Success', 'Response added successfully!');
      }
      
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      Alert.alert('Error', 'Please fill in title and message');
      return;
    }

    try {
      const metadata: any = {};
      if (announcementForm.type === 'new_item' && announcementForm.dishName) {
        metadata.dishName = announcementForm.dishName;
      }
      if (announcementForm.type === 'special_offer' && announcementForm.discountPercentage) {
        metadata.discountPercentage = parseInt(announcementForm.discountPercentage);
      }

      await createAnnouncement({
        chefId: '1', // Current chef ID
        chefName: user?.name || 'Chef',
        type: announcementForm.type,
        title: announcementForm.title,
        message: announcementForm.message,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });

      setShowAnnouncementModal(false);
      setAnnouncementForm({
        type: 'announcement',
        title: '',
        message: '',
        dishName: '',
        discountPercentage: '',
      });
      Alert.alert('Success', `Announcement sent to ${subscriberCount} subscribers!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create announcement. Please try again.');
    }
  };

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
        <TouchableOpacity 
          style={styles.respondButton}
          onPress={() => handleRespondToReview(review)}
        >
          <MessageCircle size={14} color="#000000" />
          <Text style={styles.respondButtonText}>Respond</Text>
        </TouchableOpacity>
      )}
      {review.chefResponse && (
        <TouchableOpacity 
          style={styles.editResponseButton}
          onPress={() => handleRespondToReview(review)}
        >
          <MessageCircle size={14} color="#545454" />
          <Text style={styles.editResponseButtonText}>Edit Response</Text>
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

  const ResponseModal = () => (
    <Modal visible={showResponseModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedReview?.chefResponse ? 'Edit Response' : 'Respond to Review'}
          </Text>
          <TouchableOpacity onPress={() => setShowResponseModal(false)}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedReview && (
            <View style={styles.reviewPreview}>
              <View style={styles.previewHeader}>
                <View style={styles.previewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color={star <= selectedReview.rating ? "#FFCC02" : "#EEEEEE"}
                      fill={star <= selectedReview.rating ? "#FFCC02" : "transparent"}
                    />
                  ))}
                </View>
                <Text style={styles.previewUserName}>{selectedReview.userName}</Text>
              </View>
              <Text style={styles.previewText}>{selectedReview.reviewText}</Text>
            </View>
          )}

          <View style={styles.responseSection}>
            <Text style={styles.responseLabel}>Your Response</Text>
            <TextInput
              style={styles.responseInput}
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Thank the customer and address their feedback professionally..."
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{responseText.length}/500</Text>
          </View>

          <View style={styles.guidelinesSection}>
            <Text style={styles.guidelinesTitle}>Response Guidelines:</Text>
            <Text style={styles.guideline}>• Thank the customer for their feedback</Text>
            <Text style={styles.guideline}>• Address any specific concerns mentioned</Text>
            <Text style={styles.guideline}>• Keep it professional and friendly</Text>
            <Text style={styles.guideline}>• Invite them to order again</Text>
          </View>

          <View style={styles.responseButtons}>
            <TouchableOpacity 
              style={styles.cancelResponseButton}
              onPress={() => setShowResponseModal(false)}
            >
              <Text style={styles.cancelResponseButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitResponseButton}
              onPress={handleSubmitResponse}
            >
              <Send size={16} color={COLORS.text.white} />
              <Text style={styles.submitResponseButtonText}>
                {selectedReview?.chefResponse ? 'Update' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
            <MetricCard
              title="Today's Revenue"
              value="₹2,450"
              icon={DollarSign}
              color={COLORS.success}
              change="+12%"
              size="small"
            />
            <MetricCard
              title="Orders Today"
              value="23"
              icon={ShoppingBag}
              color={COLORS.text.primary}
              change="+8%"
              size="small"
            />
            <MetricCard
              title="Active Customers"
              value="156"
              icon={Users}
              color={COLORS.text.primary}
              change="+15%"
              size="small"
            />
            <MetricCard
              title="Rating"
              value="4.8"
              icon={Star}
              color={COLORS.rating}
              change="+0.2"
              size="small"
            />
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

        {/* Subscribers & Announcements */}
        <View style={styles.section}>
          <SectionHeader
            title="Subscribers & Announcements"
            actionText="Announce"
            actionIcon={PlusIcon}
            onActionPress={() => setShowAnnouncementModal(true)}
          />
          
          <View style={styles.subscribersCard}>
            <View style={styles.subscribersInfo}>
              <Bell size={20} color="#000000" />
              <View style={styles.subscribersDetails}>
                <Text style={styles.subscribersCount}>{subscriberCount} Subscribers</Text>
                <Text style={styles.subscribersText}>Customers following your updates</Text>
              </View>
            </View>
            <Text style={styles.subscribersNote}>
              Send announcements about new dishes, special offers, and updates to your subscribers
            </Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Orders"
            actionText="View all"
            onActionPress={() => router.push('/(tabs)/chef-orders' as any)}
            showChevron
          />
          <View style={styles.ordersContainer}>
            {RECENT_ORDERS.map(renderOrderCard)}
          </View>
        </View>

        {/* Reviews & Responses */}
        <View style={styles.section}>
          <SectionHeader
            title="Customer Reviews"
            actionText="View all"
            onActionPress={() => {}}
            showChevron
          />
          
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
              <EmptyState
                icon={Star}
                title="No reviews yet"
                subtitle="Start cooking to receive your first review!"
                iconColor={COLORS.border.light}
              />
            )}
          </View>
        </View>

        {/* Popular Dishes */}
        <View style={styles.section}>
          <SectionHeader
            title="Popular Dishes"
            actionText="Manage menu"
            onActionPress={() => router.push('/(tabs)/chef-menu-management' as any)}
            showChevron
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll}>
            {MENU_HIGHLIGHTS.map(renderMenuCard)}
          </ScrollView>
        </View>
      </ScrollView>

      <ResponseModal />
      
      {/* Announcement Modal */}
      <Modal visible={showAnnouncementModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Announcement</Text>
            <TouchableOpacity onPress={() => setShowAnnouncementModal(false)}>
              <X size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.announcementTypeSection}>
              <Text style={styles.formLabel}>Announcement Type</Text>
              <View style={styles.typeOptions}>
                {[
                  { id: 'new_item', label: 'New Menu Item', emoji: '🍽️' },
                  { id: 'special_offer', label: 'Special Offer', emoji: '🎉' },
                  { id: 'announcement', label: 'General Update', emoji: '📢' },
                  { id: 'price_change', label: 'Price Update', emoji: '💰' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      announcementForm.type === type.id && styles.selectedTypeOption
                    ]}
                    onPress={() => setAnnouncementForm(prev => ({ ...prev, type: type.id as any }))}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text style={[
                      styles.typeText,
                      announcementForm.type === type.id && styles.selectedTypeText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={announcementForm.title}
                onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, title: text }))}
                placeholder="e.g., New Dish Added!, Weekend Special!"
                maxLength={50}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={announcementForm.message}
                onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, message: text }))}
                placeholder="Tell your subscribers about your update..."
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={styles.characterCount}>{announcementForm.message.length}/200</Text>
            </View>

            {announcementForm.type === 'new_item' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dish Name (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={announcementForm.dishName}
                  onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, dishName: text }))}
                  placeholder="Name of the new dish"
                />
              </View>
            )}

            {announcementForm.type === 'special_offer' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Discount Percentage (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={announcementForm.discountPercentage}
                  onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, discountPercentage: text }))}
                  placeholder="e.g., 25"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.subscribersInfo}>
              <Text style={styles.subscribersInfoText}>
                This announcement will be sent to {subscriberCount} subscribers
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.sendAnnouncementButton}
              onPress={handleCreateAnnouncement}
            >
              <Bell size={16} color={COLORS.text.white} />
              <Text style={styles.sendAnnouncementText}>Send to Subscribers</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    flexWrap: 'wrap',
    gap: SPACING.md,
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
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  actionText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
    textAlign: 'center',
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
  editResponseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.xxl,
    gap: SPACING.xs,
  },
  editResponseButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  reviewPreview: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  previewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  previewUserName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  previewText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  responseSection: {
    marginBottom: SPACING.lg,
  },
  responseLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  responseInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  characterCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  guidelinesSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  guidelinesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  guideline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelResponseButton: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  cancelResponseButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
  },
  submitResponseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  submitResponseButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  createAnnouncementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
    gap: SPACING.xs,
    minHeight: 36,
  },
  createAnnouncementText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  announcementTypeSection: {
    marginBottom: SPACING.lg,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    gap: SPACING.sm,
    minHeight: 60,
  },
  selectedTypeOption: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  selectedTypeText: {
    color: COLORS.text.white,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  formInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  subscribersInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  sendAnnouncementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  sendAnnouncementText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  subscribersCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    ...SHADOWS.subtle,
  },
  subscribersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  subscribersDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  subscribersCount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subscribersText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  subscribersNote: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});