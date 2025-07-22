import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, MapPin, Phone, Mail, Settings, Heart, CreditCard, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Camera, Star, Award, Truck, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRewards } from '@/hooks/useRewards';
import { useAddresses } from '@/hooks/useAddresses';
import { useReviews } from '@/hooks/useReviews';
import { isFeatureEnabled } from '@/config/featureFlags';

const PROFILE_MENU_ITEMS = [
  {
    label: 'Edit Profile',
    action: 'editProfile',
    icon: Edit,
    rightText: null,
  },
  {
    label: 'Manage Addresses',
    action: 'addresses',
    icon: MapPin,
    rightText: null,
  },
  {
    label: 'Payment Methods',
    action: 'payments',
    icon: CreditCard,
    rightText: null,
  },
  ...(isFeatureEnabled('ENABLE_REWARDS_SYSTEM') 
    ? [{
        label: 'Rewards & Tokens',
        action: 'rewards',
        icon: Award,
        rightText: null,
      }]
    : []
  ),
  {
    label: 'My Reviews',
    action: 'reviews',
    icon: Star,
    rightText: null,
  },
  {
    label: 'Settings',
    action: 'settings',
    icon: Settings,
    rightText: null,
  },
  {
    label: 'Help & Support',
    action: 'support',
    icon: HelpCircle,
    rightText: null,
  },
];

export default function Profile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const { user, logout, updateProfile } = useAuth();
  const { rewards } = useRewards();
  const { addresses } = useAddresses();
  const { userReviews } = useReviews();
  const router = useRouter();

  const PROFILE_STATS = [
    { label: 'Total Orders', value: '24', icon: Truck, color: '#FF6B35' },
    { label: 'Favorite Chefs', value: '8', icon: Heart, color: '#E91E63' },
    { label: 'Reviews Given', value: userReviews.length.toString(), icon: Star, color: '#FFD700' },
    ...(isFeatureEnabled('ENABLE_REWARDS_SYSTEM') 
      ? [{ label: 'Reward Tokens', value: rewards.totalTokens.toString(), icon: Award, color: '#4CAF50' }]
      : []
    ),
  ];

  React.useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
      setEditedPhone(user.phone || '');
    }
  }, [user]);

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'editProfile':
        setShowEditModal(true);
        break;
      case 'addresses':
        router.push('/(tabs)/addresses' as any);
        break;
      case 'reviews':
        setShowReviewsModal(true);
        break;
      case 'payments':
        router.push('/(tabs)/payment' as any);
        break;
      case 'rewards':
        router.push('/(tabs)/rewards' as any);
        break;
      case 'settings':
        router.push('/(tabs)/settings' as any);
        break;
      default:
        // Handle other actions
        break;
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: editedName,
        phone: editedPhone,
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const renderStatCard = (stat: typeof PROFILE_STATS[0], index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
        <stat.icon size={20} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const renderMenuItem = (item: typeof PROFILE_MENU_ITEMS[0], index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.menuItem}
      onPress={() => handleMenuAction(item.action)}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <item.icon size={20} color="#FF6B35" />
        </View>
        <Text style={styles.menuLabel}>
          {item.action === 'addresses' ? `Manage Addresses` : item.label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.action === 'addresses' ? (
          <Text style={styles.menuRightText}>{addresses.length} saved</Text>
        ) : item.rightText ? (
          <Text style={styles.menuRightText}>{item.rightText}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderReviewCard = (review: typeof RECENT_REVIEWS[0]) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg' }} style={styles.reviewChefImage} />
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewChefName}>{review.chefName}</Text>
          <Text style={styles.reviewDish}>{review.dishName}</Text>
          <View style={styles.reviewRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                color={star <= review.rating ? "#FFD700" : "#E0E0E0"}
                fill={star <= review.rating ? "#FFD700" : "transparent"}
              />
            ))}
            <Text style={styles.reviewDate}>{review.createdAt.toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{review.reviewText}</Text>
    </View>
  );

  const EditProfileModal = () => (
    <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.profileImageSection}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg' }} 
              style={styles.editProfileImage}
            />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Camera size={16} color="#FF6B35" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name</Text>
            <TextInput
              style={styles.formInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number</Text>
            <TextInput
              style={styles.formInput}
              value={editedPhone}
              onChangeText={setEditedPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={[styles.formInput, styles.disabledInput]}
              value={user?.email || ''}
              editable={false}
              placeholder="Email cannot be changed"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const ReviewsModal = () => (
    <Modal visible={showReviewsModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>My Reviews</Text>
          <TouchableOpacity onPress={() => setShowReviewsModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {userReviews.length > 0 ? (
            userReviews.slice(0, 10).map(renderReviewCard)
          ) : (
            <View style={styles.noReviewsState}>
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>Your reviews will appear here after you rate orders</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg' }} 
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Edit size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Phone size={14} color="#666" />
                <Text style={styles.contactText}>{user?.phone || '+91 98765 43210'}</Text>
              </View>
              <View style={styles.contactItem}>
                <Mail size={14} color="#666" />
                <Text style={styles.contactText}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setShowEditModal(true)}
            >
              <Edit size={16} color="#FF6B35" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsContainer}>
            {PROFILE_STATS.map(renderStatCard)}
          </View>
        </View>

        {/* Recent Reviews Preview */}
        <View style={styles.recentReviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity onPress={() => setShowReviewsModal(true)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {userReviews.slice(0, 2).map(renderReviewCard)}
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {PROFILE_MENU_ITEMS.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>HomeChef App v1.0.0</Text>
      </ScrollView>

      <EditProfileModal />
      <ReviewsModal />
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  recentReviewsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewChefImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewChefName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  reviewDish: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewDate: {
    fontSize: 10,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 13,
    color: '#2C3E50',
    lineHeight: 18,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  menuItemRight: {
    alignItems: 'flex-end',
  },
  menuRightText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#BDC3C7',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF5F0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  changePhotoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#2C3E50',
  },
  disabledInput: {
    backgroundColor: '#F8F9FA',
    color: '#7F8C8D',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});