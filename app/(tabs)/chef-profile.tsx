import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CreditCard as Edit, Save, X, Plus, Star, MapPin, Clock, Award, Users, Calendar, ChevronRight, Settings } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useWorkingHours } from '@/hooks/useWorkingHours';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getResponsiveDimensions } from '@/utils/responsive';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, ICON_SIZES } from '@/utils/constants';

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
  const { isWeb, isDesktop } = getResponsiveDimensions();
  const { 
    getCurrentWeekSchedule, 
    getNextWeekSchedule, 
    updateSchedule, 
    requestScheduleChange, 
    canEditCurrentWeek,
    hasActiveOrders 
  } = useWorkingHours();
  const [isEditing, setIsEditing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  
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

  const currentWeekSchedule = getCurrentWeekSchedule(user?.id || '');
  const nextWeekSchedule = getNextWeekSchedule(user?.id || '');
  const [editingSchedule, setEditingSchedule] = useState<'current' | 'next'>('next');
  const [tempSchedule, setTempSchedule] = useState(nextWeekSchedule?.schedule || []);
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

  const handleWorkingHoursEdit = (weekType: 'current' | 'next') => {
    setEditingSchedule(weekType);
    const schedule = weekType === 'current' ? currentWeekSchedule : nextWeekSchedule;
    setTempSchedule(schedule?.schedule || []);
    setShowWorkingHoursModal(true);
  };

  const handleSaveWorkingHours = async () => {
    if (!user) return;

    const schedule = editingSchedule === 'current' ? currentWeekSchedule : nextWeekSchedule;
    if (!schedule) return;

    // If editing current week and has active orders, show change request modal
    if (editingSchedule === 'current' && hasActiveOrders(user.id, schedule.weekStartDate)) {
      setShowWorkingHoursModal(false);
      setShowChangeRequestModal(true);
      return;
    }

    // Update schedule directly for future weeks
    const success = await updateSchedule(user.id, tempSchedule, schedule.weekStartDate);
    if (success) {
      setShowWorkingHoursModal(false);
      Alert.alert('Success', 'Working hours updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update working hours. Please try again.');
    }
  };

  const handleSubmitChangeRequest = async () => {
    if (!user || !changeReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the schedule change');
      return;
    }

    const success = await requestScheduleChange(user.id, tempSchedule, changeReason.trim());
    if (success) {
      setShowChangeRequestModal(false);
      setChangeReason('');
      Alert.alert(
        'Request Submitted',
        'Your schedule change request has been sent to admin for approval. You will be notified once reviewed.'
      );
    } else {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
  };

  const toggleDayWorking = (dayIndex: number) => {
    setTempSchedule(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, isWorking: !day.isWorking } : day
    ));
  };

  const updateDayHours = (dayIndex: number, field: 'start' | 'end', value: string) => {
    setTempSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, hours: { ...day.hours, [field]: value } }
        : day
    ));
  };

  const toggleSpecialty = (specialtyId: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId]
    }));
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

  const renderStatCard = (icon: any, label: string, value: string, color: string) => {
    return (
      <MetricCard
        title={label}
        value={value}
        icon={icon}
        color={color}
        size="small"
      />
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
            style={[styles.editButton, isEditing && styles.editButtonActive]}
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
          <SectionHeader title="Performance Stats" />
          <View style={styles.statsGrid}>
            <MetricCard
              title="Total Orders"
              value={stats.totalOrders.toString()}
              icon={Award}
              color={COLORS.success}
              size="small"
            />
            <MetricCard
              title="Rating"
              value={stats.rating.toString()}
              icon={Star}
              color={COLORS.rating}
              size="small"
            />
            <MetricCard
              title="Repeat Customers"
              value={stats.repeatCustomers.toString()}
              icon={Users}
              color={COLORS.info}
              size="small"
            />
            <MetricCard
              title="Monthly Earnings"
              value={`₹${stats.monthlyEarnings.toLocaleString()}`}
              icon={Clock}
              color={COLORS.primary}
              size="small"
            />
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <SectionHeader title="About Me" />
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
          <SectionHeader
            title="My Specialties"
            actionText={isEditing ? "Edit" : undefined}
            actionIcon={isEditing ? Plus : undefined}
            onActionPress={isEditing ? () => setShowCategoryModal(true) : undefined}
          />
          <View style={styles.specialtiesContainer}>
            {profileData.specialties.map(specialtyId => 
              renderSpecialtyChip(specialtyId, true)
            )}
          </View>
        </View>

        {/* Dietary Preference */}
        <View style={styles.section}>
          <SectionHeader
            title="Dietary Preference"
            actionText={isEditing ? "Edit" : undefined}
            actionIcon={isEditing ? Edit : undefined}
            onActionPress={isEditing ? () => setShowDietaryModal(true) : undefined}
          />
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
          <SectionHeader title="Business Details" />
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
        <View style={[styles.section, isWeb && styles.webSection]}>
          <SectionHeader
            title="Working Hours"
            icon={Clock}
            actionText="Manage"
            actionIcon={Settings}
            onActionPress={() => handleWorkingHoursEdit('next')}
          />
          
          {/* Current Week Schedule */}
          {currentWeekSchedule && (
            <View style={[styles.scheduleCard, isWeb && styles.webScheduleCard]}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleHeaderLeft}>
                  <Calendar size={16} color={COLORS.text.primary} />
                  <Text style={styles.scheduleTitle}>This Week</Text>
                  <View style={styles.weekDates}>
                    <Text style={styles.weekDatesText}>
                      {currentWeekSchedule.weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {currentWeekSchedule.weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.scheduleActions}>
                  {canEditCurrentWeek(user?.id || '') ? (
                    <TouchableOpacity 
                      style={styles.editScheduleButton}
                      onPress={() => handleWorkingHoursEdit('current')}
                    >
                      <Edit size={14} color={COLORS.text.white} />
                      <Text style={styles.editScheduleText}>Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.lockedSchedule}>
                      <Text style={styles.lockedText}>🔒 Locked</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.daysContainer, isWeb && styles.webDaysContainer]}>
                {currentWeekSchedule.schedule.map((day, index) => (
                  <View key={day.day} style={[styles.dayChip, day.isWorking && styles.activeDayChip, isWeb && styles.webDayChip]}>
                    <Text style={[styles.dayText, day.isWorking && styles.activeDayText]}>
                      {day.day.substring(0, 3).toUpperCase()}
                    </Text>
                    {day.isWorking && (
                      <>
                        <Text style={styles.dayHours}>
                          {day.hours.start}
                        </Text>
                        <Text style={styles.dayHours}>
                          {day.hours.end}
                        </Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Next Week Schedule */}
          {nextWeekSchedule && (
            <View style={[styles.scheduleCard, isWeb && styles.webScheduleCard]}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleHeaderLeft}>
                  <Calendar size={16} color={COLORS.success} />
                  <Text style={[styles.scheduleTitle, { color: COLORS.success }]}>Next Week</Text>
                  <View style={[styles.weekDates, { backgroundColor: COLORS.success + '15' }]}>
                    <Text style={[styles.weekDatesText, { color: COLORS.success }]}>
                      {nextWeekSchedule.weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {nextWeekSchedule.weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.editScheduleButton, { backgroundColor: COLORS.success }]}
                  onPress={() => handleWorkingHoursEdit('next')}
                >
                  <Edit size={14} color={COLORS.text.white} />
                  <Text style={styles.editScheduleText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.daysContainer, isWeb && styles.webDaysContainer]}>
                {nextWeekSchedule.schedule.map((day, index) => (
                  <View key={day.day} style={[styles.dayChip, day.isWorking && styles.activeDayChip, isWeb && styles.webDayChip]}>
                    <Text style={[styles.dayText, day.isWorking && styles.activeDayText]}>
                      {day.day.substring(0, 3).toUpperCase()}
                    </Text>
                    {day.isWorking && (
                      <>
                        <Text style={styles.dayHours}>
                          {day.hours.start}
                        </Text>
                        <Text style={styles.dayHours}>
                          {day.hours.end}
                        </Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Certificates & Achievements */}
        <View style={styles.section}>
         <SectionHeader title="Certificates & Achievements" />
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
      
      {/* Working Hours Modal */}
      <Modal visible={showWorkingHoursModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, isWeb && styles.webModalContainer]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Clock size={20} color={COLORS.text.primary} />
              <Text style={styles.modalTitle}>
                {editingSchedule === 'current' ? 'Current' : 'Next'} Week Schedule
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowWorkingHoursModal(false)}>
              <X size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={[styles.modalContent, isWeb && styles.webModalContent]}>
            {editingSchedule === 'current' && hasActiveOrders(user?.id || '', currentWeekSchedule?.weekStartDate || new Date()) && (
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <View style={styles.warningIcon}>
                    <Text style={styles.warningEmoji}>⚠️</Text>
                  </View>
                  <Text style={styles.warningTitle}>Admin Approval Required</Text>
                </View>
                <Text style={styles.warningText}>
                  This week has active orders. Any changes will require admin approval to prevent customer disruption.
                </Text>
              </View>
            )}

            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <Settings size={16} color={COLORS.text.primary} />
                <Text style={styles.instructionsTitle}>Schedule Instructions</Text>
              </View>
              <Text style={styles.scheduleInstructions}>
                Set your working hours for each day. Toggle days on/off and adjust timings as needed.
              </Text>
            </View>

            <View style={[styles.scheduleEditContainer, isWeb && styles.webScheduleEditContainer]}>
              {tempSchedule.map((day, index) => (
                <View key={day.day} style={[styles.dayScheduleCard, isWeb && styles.webDayScheduleCard]}>
                  <View style={styles.dayScheduleHeader}>
                    <View style={styles.dayNameContainer}>
                      <Text style={styles.dayName}>
                        {day.day.charAt(0).toUpperCase() + day.day.slice(1)}
                      </Text>
                      <Text style={styles.dayDate}>
                        {new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.dayToggle, day.isWorking && styles.dayToggleActive]}
                      onPress={() => toggleDayWorking(index)}
                    >
                      <Text style={[styles.dayToggleText, day.isWorking && styles.dayToggleTextActive]}>
                        {day.isWorking ? 'Open' : 'Closed'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {day.isWorking && (
                    <View style={styles.timeInputs}>
                      <View style={styles.timeInputGroup}>
                        <Text style={styles.timeInputLabel}>Opens at</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={day.hours.start}
                          onChangeText={(text) => updateDayHours(index, 'start', text)}
                          placeholder="09:00"
                        />
                      </View>
                      <View style={styles.timeInputGroup}>
                        <Text style={styles.timeInputLabel}>Closes at</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={day.hours.end}
                          onChangeText={(text) => updateDayHours(index, 'end', text)}
                          placeholder="21:00"
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.saveScheduleButton, isWeb && styles.webSaveButton]} onPress={handleSaveWorkingHours}>
              <Save size={20} color={COLORS.text.white} />
              <Text style={styles.saveScheduleButtonText}>Save Schedule</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Change Request Modal */}
      <Modal visible={showChangeRequestModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Schedule Change</Text>
            <TouchableOpacity onPress={() => setShowChangeRequestModal(false)}>
              <X size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.requestWarning}>
              <Text style={styles.requestWarningTitle}>Admin Approval Required</Text>
              <Text style={styles.requestWarningText}>
                Since this week has active orders, your schedule change requires admin approval to ensure customer orders are not affected.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason for Change *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={changeReason}
                onChangeText={setChangeReason}
                placeholder="Please explain why you need to change your working hours..."
                multiline
                numberOfLines={4}
                maxLength={300}
              />
              <Text style={styles.characterCount}>{changeReason.length}/300</Text>
            </View>

            <View style={styles.requestButtons}>
              <TouchableOpacity 
                style={styles.cancelRequestButton}
                onPress={() => setShowChangeRequestModal(false)}
              >
                <Text style={styles.cancelRequestButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitRequestButton}
                onPress={handleSubmitChangeRequest}
              >
                <Text style={styles.submitRequestButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  editButtonActive: {
    backgroundColor: '#FF6B35',
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
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  webSection: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
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
    fontWeight: '600',
    marginBottom: 4,
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
  scheduleCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  webScheduleCard: {
    padding: SPACING.xl * 1.5,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scheduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  scheduleTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  weekDates: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekDatesText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  editScheduleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  lockedSchedule: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  lockedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  webDaysContainer: {
    gap: SPACING.md,
  },
  dayChip: {
    flex: 1,
    minWidth: 80,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  activeDayChip: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  webDayChip: {
    minWidth: 100,
    paddingVertical: SPACING.xl,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  activeDayText: {
    color: COLORS.text.white,
    fontWeight: '600',
  },
  dayHours: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.white,
    fontWeight: '500',
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
  webModalContainer: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  webModalContent: {
    paddingHorizontal: SPACING.xl * 2,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: SPACING.xl,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  warningIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningEmoji: {
    fontSize: 16,
  },
  warningTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.warning,
  },
  warningText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warning,
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  instructionsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  scheduleInstructions: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  scheduleEditContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  webScheduleEditContainer: {
    gap: SPACING.lg,
  },
  dayScheduleCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  webDayScheduleCard: {
    padding: SPACING.xl * 1.5,
  },
  dayScheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dayNameContainer: {
    flex: 1,
  },
  dayName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  dayDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  dayToggle: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dayToggleActive: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  dayToggleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  dayToggleTextActive: {
    color: COLORS.text.white,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  timeInput: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  saveScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.xl,
    borderRadius: 12,
    gap: SPACING.sm,
    marginBottom: SPACING.xl * 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webSaveButton: {
    paddingVertical: SPACING.xl * 1.5,
  },
  saveScheduleButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
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
  requestWarning: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  requestWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 6,
  },
  requestWarningText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelRequestButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelRequestButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '500',
  },
  submitRequestButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});