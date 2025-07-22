import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CreditCard as Edit, Save, X, Plus, Star, MapPin, Clock, Award, Users } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

const CUISINE_CATEGORIES = [
  { id: 'north_indian', label: 'North Indian', emoji: '🍛' },
  { id: 'south_indian', label: 'South Indian', emoji: '🥞' },
  { id: 'gujarati', label: 'Gujarati', emoji: '🍽️' },
  { id: 'punjabi', label: 'Punjabi', emoji: '🫓' },
  { id: 'bengali', label: 'Bengali', emoji: '🐟' },
  { id: 'maharashtrian', label: 'Maharashtrian', emoji: '🌶️' },
  { id: 'rajasthani', label: 'Rajasthani', emoji: '🏜️' },
  { id: 'kerala', label: 'Kerala', emoji: '🥥' },
  { id: 'street_food', label: 'Street Food', emoji: '🌮' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰' },
  { id: 'beverages', label: 'Beverages', emoji: '☕' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'fusion', label: 'Fusion', emoji: '🌍' },
];

const DIETARY_PREFERENCES = [
  { id: 'pure_veg', label: 'Pure Vegetarian', emoji: '🟢' },
  { id: 'veg_nonveg', label: 'Veg & Non-Veg', emoji: '🔴' },
  { id: 'vegan_only', label: 'Vegan Only', emoji: '🌱' },
  { id: 'jain_food', label: 'Jain Food', emoji: '🙏' },
];

export default function ChefProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: 'Passionate home chef specializing in authentic Indian cuisine with 8+ years of experience.',
    specialties: ['north_indian', 'punjabi'],
    dietaryPreference: 'veg_nonveg',
    experience: '8 years',
    location: 'Mumbai, Maharashtra',
    phone: user?.phone || '',
    email: user?.email || '',
    minOrder: 200,
    deliveryRadius: 5,
    preparationTime: '30-45 minutes',
    workingHours: {
      start: '10:00 AM',
      end: '9:00 PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    coverImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    certificates: ['FSSAI License', 'Food Safety Training'],
    achievements: ['Top Rated Chef', '500+ Orders', 'Customer Favorite'],
  });

  const [stats] = useState({
    totalOrders: 847,
    rating: 4.8,
    totalReviews: 234,
    repeatCustomers: 156,
    monthlyEarnings: 45600,
  });

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId]
    }));
  };

  const renderStatCard = (icon: any, label: string, value: string, color: string) => {
    const IconComponent = icon;
    return (
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  };

  const renderSpecialtyChip = (specialtyId: string, isSelected: boolean) => {
    const specialty = CUISINE_CATEGORIES.find(c => c.id === specialtyId);
    if (!specialty) return null;

    return (
      <TouchableOpacity
        key={specialtyId}
        style={[
          styles.specialtyChip,
          isSelected && styles.selectedSpecialtyChip
        ]}
        onPress={() => isEditing && toggleSpecialty(specialtyId)}
        disabled={!isEditing}
      >
        <Text style={styles.specialtyEmoji}>{specialty.emoji}</Text>
        <Text style={[
          styles.specialtyText,
          isSelected && styles.selectedSpecialtyText
        ]}>
          {specialty.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const CategoryModal = () => (
    <Modal visible={showCategoryModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Your Specialties</Text>
          <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>Choose the cuisines you specialize in (you can select multiple)</Text>
          <View style={styles.categoryGrid}>
            {CUISINE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  profileData.specialties.includes(category.id) && styles.selectedCategoryOption
                ]}
                onPress={() => toggleSpecialty(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.categoryText,
                  profileData.specialties.includes(category.id) && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const DietaryModal = () => (
    <Modal visible={showDietaryModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Dietary Preference</Text>
          <TouchableOpacity onPress={() => setShowDietaryModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>What type of food do you prepare?</Text>
          {DIETARY_PREFERENCES.map((preference) => (
            <TouchableOpacity
              key={preference.id}
              style={[
                styles.dietaryOption,
                profileData.dietaryPreference === preference.id && styles.selectedDietaryOption
              ]}
              onPress={() => {
                setProfileData(prev => ({ ...prev, dietaryPreference: preference.id }));
                setShowDietaryModal(false);
              }}
            >
              <Text style={styles.dietaryEmoji}>{preference.emoji}</Text>
              <Text style={[
                styles.dietaryText,
                profileData.dietaryPreference === preference.id && styles.selectedDietaryText
              ]}>
                {preference.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Edit Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chef Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Save</Text>
              </>
            ) : (
              <>
                <Edit size={16} color="#FF6B35" />
                <Text style={styles.editButtonTextOrange}>Edit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Cover Image */}
        <View style={styles.coverImageContainer}>
          <Image source={{ uri: profileData.coverImage }} style={styles.coverImage} />
          {isEditing && (
            <TouchableOpacity style={styles.changeCoverButton}>
              <Camera size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Image and Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Camera size={16} color="#FF6B35" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.basicInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.chefName}>{profileData.name}</Text>
            )}
            
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{stats.rating}</Text>
              <Text style={styles.reviewCount}>({stats.totalReviews} reviews)</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#666" />
              <Text style={styles.location}>{profileData.location}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(Award, 'Total Orders', stats.totalOrders.toString(), '#4CAF50')}
            {renderStatCard(Star, 'Rating', stats.rating.toString(), '#FFD700')}
            {renderStatCard(Users, 'Repeat Customers', stats.repeatCustomers.toString(), '#2196F3')}
            {renderStatCard(Clock, 'Monthly Earnings', `₹${stats.monthlyEarnings.toLocaleString()}`, '#FF6B35')}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell customers about yourself and your cooking..."
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.bioText}>{profileData.bio}</Text>
          )}
        </View>

        {/* Specialties Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Specialties</Text>
            {isEditing && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Plus size={16} color="#FF6B35" />
                <Text style={styles.addButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.specialtiesContainer}>
            {profileData.specialties.map(specialtyId => 
              renderSpecialtyChip(specialtyId, true)
            )}
          </View>
        </View>

        {/* Dietary Preference */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dietary Preference</Text>
            {isEditing && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowDietaryModal(true)}
              >
                <Edit size={16} color="#FF6B35" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.dietaryContainer}>
            {DIETARY_PREFERENCES.find(p => p.id === profileData.dietaryPreference) && (
              <View style={styles.dietaryChip}>
                <Text style={styles.dietaryEmoji}>
                  {DIETARY_PREFERENCES.find(p => p.id === profileData.dietaryPreference)?.emoji}
                </Text>
                <Text style={styles.dietaryLabel}>
                  {DIETARY_PREFERENCES.find(p => p.id === profileData.dietaryPreference)?.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Business Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <View style={styles.businessGrid}>
            <View style={styles.businessItem}>
              <Text style={styles.businessLabel}>Experience</Text>
              {isEditing ? (
                <TextInput
                  style={styles.businessInput}
                  value={profileData.experience}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, experience: text }))}
                  placeholder="e.g., 5 years"
                />
              ) : (
                <Text style={styles.businessValue}>{profileData.experience}</Text>
              )}
            </View>
            
            <View style={styles.businessItem}>
              <Text style={styles.businessLabel}>Min Order</Text>
              {isEditing ? (
                <TextInput
                  style={styles.businessInput}
                  value={profileData.minOrder.toString()}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, minOrder: parseInt(text) || 0 }))}
                  placeholder="200"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.businessValue}>₹{profileData.minOrder}</Text>
              )}
            </View>
            
            <View style={styles.businessItem}>
              <Text style={styles.businessLabel}>Delivery Radius</Text>
              {isEditing ? (
                <TextInput
                  style={styles.businessInput}
                  value={profileData.deliveryRadius.toString()}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, deliveryRadius: parseInt(text) || 0 }))}
                  placeholder="5"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.businessValue}>{profileData.deliveryRadius} km</Text>
              )}
            </View>
            
            <View style={styles.businessItem}>
              <Text style={styles.businessLabel}>Prep Time</Text>
              {isEditing ? (
                <TextInput
                  style={styles.businessInput}
                  value={profileData.preparationTime}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, preparationTime: text }))}
                  placeholder="30-45 minutes"
                />
              ) : (
                <Text style={styles.businessValue}>{profileData.preparationTime}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.workingHoursContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Operating Hours:</Text>
              <Text style={styles.timeValue}>
                {profileData.workingHours.start} - {profileData.workingHours.end}
              </Text>
            </View>
            <View style={styles.daysContainer}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <View
                  key={day}
                  style={[
                    styles.dayChip,
                    profileData.workingDays.includes(day) && styles.activeDayChip
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    profileData.workingDays.includes(day) && styles.activeDayText
                  ]}>
                    {day.substring(0, 3)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Certificates & Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificates & Achievements</Text>
          <View style={styles.certificatesContainer}>
            {profileData.certificates.map((cert, index) => (
              <View key={index} style={styles.certificateChip}>
                <Award size={14} color="#4CAF50" />
                <Text style={styles.certificateText}>{cert}</Text>
              </View>
            ))}
          </View>
          <View style={styles.achievementsContainer}>
            {profileData.achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementChip}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <CategoryModal />
      <DietaryModal />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editButtonTextOrange: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  coverImageContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeCoverButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -50,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  basicInfo: {
    flex: 1,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
    marginBottom: 8,
  },
  chefName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#7F8C8D',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsGrid: {
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
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  bioText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  selectedSpecialtyChip: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FF6B35',
  },
  specialtyEmoji: {
    fontSize: 16,
  },
  specialtyText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedSpecialtyText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  dietaryContainer: {
    alignItems: 'flex-start',
  },
  dietaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  dietaryEmoji: {
    fontSize: 18,
  },
  dietaryLabel: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  businessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  businessItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  businessLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 6,
    fontWeight: '600',
  },
  businessInput: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
  },
  businessValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  workingHoursContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeDayChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dayText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  certificatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  certificateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  certificateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementChip: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  achievementText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
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
  modalSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedCategoryOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  dietaryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    gap: 12,
  },
  selectedDietaryOption: {
    borderColor: '#2196F3',
    backgroundColor: '#F0F8FF',
  },
  dietaryEmoji: {
    fontSize: 24,
  },
  dietaryText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedDietaryText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});