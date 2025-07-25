import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Alert, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Bookmark, Info, Share2, EyeOff, Flag, Star, MapPin, Clock, Users, Camera, FileText, BookmarkCheck } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useChefProfiles } from '@/hooks/useChefProfiles';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface ChefProfileModalProps {
  visible: boolean;
  onClose: () => void;
  chef: {
    id: string;
    name: string;
    image: string;
    coverImage?: string;
    specialty: string;
    rating: number;
    reviewCount: number;
    location: string;
    distance: string;
    deliveryTime: string;
    isOpen: boolean;
  };
}

const SHARE_METHODS = [
  { id: 'link', title: 'Copy Link', description: 'Copy chef profile link to clipboard' },
  { id: 'social', title: 'Social Media', description: 'Share on social platforms' },
  { id: 'message', title: 'Send Message', description: 'Share via messaging apps' },
];

export const ChefProfileModal: React.FC<ChefProfileModalProps> = ({
  visible,
  onClose,
  chef,
}) => {
  const { user } = useAuth();
  const { 
    addToCollection, 
    removeFromCollection, 
    isInCollection, 
    hideChef, 
    shareChef, 
    reportChef,
    getChefDetails 
  } = useChefProfiles();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChefDetailsModal, setShowChefDetailsModal] = useState(false);
  const [isInUserCollection, setIsInUserCollection] = useState(isInCollection(chef.id));
  const [chefDetails, setChefDetails] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    category: 'incorrect_info' as any,
    title: '',
    description: '',
  });
  const [slideAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const handleCollection = async () => {
    try {
      if (isInUserCollection) {
        const success = await removeFromCollection(chef.id);
        if (success) {
          setIsInUserCollection(false);
        }
      } else {
        const success = await addToCollection(chef.id, chef.name, chef.image);
        if (success) {
          setIsInUserCollection(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update collection');
    }
  };

  const handleShare = async (method: 'link' | 'social' | 'message') => {
    try {
      const shareUrl = await shareChef(chef.id, method);
      setShowShareModal(false);
      
      if (method === 'link') {
        // In a real app, copy to clipboard
        Alert.alert('Link Copied!', 'Chef profile link has been copied to clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share chef profile');
    }
  };

  const handleHide = () => {
    Alert.alert(
      'Hide Chef',
      `Hide ${chef.name} from your recommendations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Hide', 
          style: 'destructive',
          onPress: async () => {
            const success = await hideChef(chef.id, 'User preference');
            if (success) {
              onClose();
            }
          }
        }
      ]
    );
  };

  const handleSeeMore = async () => {
    try {
      const details = await getChefDetails(chef.id);
      setChefDetails(details);
      setShowChefDetailsModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load chef details');
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const success = await reportChef(
        chef.id,
        reportForm.category,
        reportForm.title.trim(),
        reportForm.description.trim()
      );

      if (success) {
        setShowReportModal(false);
        setReportForm({ category: 'incorrect_info', title: '', description: '' });
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const REPORT_CATEGORIES = [
    { id: 'incorrect_info', title: 'Incorrect information', description: 'Menu items, prices, photos and descriptions are incorrect' },
    { id: 'poor_quality', title: 'Poor food quality', description: 'Food quality does not match expectations or photos' },
    { id: 'hygiene_issues', title: 'Hygiene concerns', description: 'Cleanliness or food safety issues' },
    { id: 'fake_reviews', title: 'Fake reviews or ratings', description: 'Suspicious review patterns or fake ratings' },
    { id: 'pricing_issues', title: 'Pricing discrepancies', description: 'Prices different from what is shown in app' },
    { id: 'unavailable_items', title: 'Items frequently unavailable', description: 'Menu items are often out of stock' },
    { id: 'other', title: 'Other issues', description: 'Other concerns not listed above' },
  ];

  const ShareModal = () => (
    <Modal visible={showShareModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.shareModalContainer}>
        <View style={styles.shareModalHeader}>
          <Text style={styles.shareModalTitle}>Share {chef.name}</Text>
          <TouchableOpacity onPress={() => setShowShareModal(false)}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.shareModalContent}>
          {SHARE_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.shareMethodCard}
              onPress={() => handleShare(method.id as any)}
            >
              <Text style={styles.shareMethodTitle}>{method.title}</Text>
              <Text style={styles.shareMethodDescription}>{method.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );

  const ChefDetailsModal = () => (
    <Modal visible={showChefDetailsModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.detailsModalContainer}>
        <View style={styles.detailsModalHeader}>
          <Text style={styles.detailsModalTitle}>About {chef.name}</Text>
          <TouchableOpacity onPress={() => setShowChefDetailsModal(false)}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.detailsModalContent}>
          {chefDetails && (
            <>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>About</Text>
                <Text style={styles.detailText}>{chefDetails.description}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Experience & Certifications</Text>
                <Text style={styles.detailText}>Experience: {chefDetails.experience}</Text>
                {chefDetails.certifications.map((cert: string, index: number) => (
                  <Text key={index} style={styles.certificationText}>✓ {cert}</Text>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Working Hours</Text>
                {Object.entries(chefDetails.workingHours).map(([day, hours]: [string, any]) => (
                  <View key={day} style={styles.workingHourRow}>
                    <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                    <Text style={styles.hoursText}>
                      {hours.isOpen ? `${hours.start} - ${hours.end}` : 'Closed'}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Statistics</Text>
                <Text style={styles.detailText}>Total Orders: {chefDetails.stats.totalOrders}</Text>
                <Text style={styles.detailText}>Repeat Customers: {chefDetails.stats.repeatCustomers}</Text>
                <Text style={styles.detailText}>Response Time: {chefDetails.stats.responseTime}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const ReportModal = () => (
    <Modal visible={showReportModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.reportModalContainer}>
        <View style={styles.reportModalHeader}>
          <Text style={styles.reportModalTitle}>Report fraud or bad practices</Text>
          <TouchableOpacity onPress={() => setShowReportModal(false)}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.reportModalContent}>
          <Text style={styles.reportDescription}>
            Menu items, prices, photos and descriptions are set directly by the chef. 
            In case you see any incorrect information, please report it to us.
          </Text>
          
          <View style={styles.reportForm}>
            <Text style={styles.formLabel}>Report Category</Text>
            {REPORT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  reportForm.category === category.id && styles.selectedCategoryOption
                ]}
                onPress={() => setReportForm(prev => ({ ...prev, category: category.id as any }))}
              >
                <Text style={[
                  styles.categoryTitle,
                  reportForm.category === category.id && styles.selectedCategoryTitle
                ]}>
                  {category.title}
                </Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.formLabel}>Issue Title</Text>
            <TextInput
              style={styles.formInput}
              value={reportForm.title}
              onChangeText={(text) => setReportForm(prev => ({ ...prev, title: text }))}
              placeholder="Brief description of the issue"
              maxLength={100}
            />

            <Text style={styles.formLabel}>Detailed Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={reportForm.description}
              onChangeText={(text) => setReportForm(prev => ({ ...prev, description: text }))}
              placeholder="Please provide specific details about the issue..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <TouchableOpacity style={styles.submitReportButton} onPress={handleSubmitReport}>
              <Text style={styles.submitReportText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <>
      <Modal 
        visible={visible} 
        transparent 
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={onClose}
          />
          
          <Animated.View 
            style={[
              styles.bottomSheet,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  })
                }]
              }
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />
            
            {/* Chef Info Header */}
            <View style={styles.chefHeader}>
              <Text style={styles.chefName}>{chef.name}</Text>
              <View style={styles.chefMeta}>
                <Star size={14} color="#000000" fill="#000000" />
                <Text style={styles.rating}>{chef.rating}</Text>
                <Text style={styles.reviewCount}>({chef.reviewCount})</Text>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.deliveryTime}>{chef.deliveryTime}</Text>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.distance}>{chef.distance}</Text>
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={12} color="#8E8E93" />
                <Text style={styles.location}>{chef.location}</Text>
              </View>
              <Text style={styles.specialty}>{chef.specialty}</Text>
            </View>

            {/* Action Options */}
            <View style={styles.optionsContainer}>
              {/* Add to Collection */}
              <TouchableOpacity style={styles.optionItem} onPress={handleCollection}>
                {isInUserCollection ? (
                  <BookmarkCheck size={20} color="#000000" />
                ) : (
                  <Bookmark size={20} color="#8E8E93" />
                )}
                <Text style={[styles.optionText, isInUserCollection && styles.activeOptionText]}>
                  {isInUserCollection ? 'Added to Collection' : 'Add to Collection'}
                </Text>
              </TouchableOpacity>

              {/* See more about this chef */}
              <TouchableOpacity style={styles.optionItem} onPress={handleSeeMore}>
                <Info size={20} color="#8E8E93" />
                <Text style={styles.optionText}>See more about this chef</Text>
              </TouchableOpacity>

              {/* Share this chef */}
              <TouchableOpacity style={styles.optionItem} onPress={() => setShowShareModal(true)}>
                <Share2 size={20} color="#8E8E93" />
                <Text style={styles.optionText}>Share this chef</Text>
              </TouchableOpacity>

              {/* Hide this chef */}
              <TouchableOpacity style={styles.optionItem} onPress={handleHide}>
                <EyeOff size={20} color="#8E8E93" />
                <Text style={styles.optionText}>Hide this chef</Text>
              </TouchableOpacity>

              {/* Report fraud or bad practices */}
              <TouchableOpacity style={styles.reportOption} onPress={() => setShowReportModal(true)}>
                <Flag size={20} color="#8E8E93" />
                <View style={styles.reportContent}>
                  <Text style={styles.reportTitle}>Report fraud or bad practices</Text>
                  <Text style={styles.reportSubtitle}>
                    Menu items, prices, photos and descriptions are set directly by the chef. 
                    In case you see any incorrect information, please report it to us.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ShareModal />
      <ChefDetailsModal />
      <ReportModal />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Safe area padding
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  chefHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chefName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  chefMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  metaDivider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  distance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#8E8E93',
  },
  specialty: {
    fontSize: 14,
    color: '#8E8E93',
  },
  optionsContainer: {
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
  },
  activeOptionText: {
    color: '#000000',
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  // Share Modal Styles
  shareModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  shareModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  shareModalContent: {
    flex: 1,
    padding: SPACING.xl,
  },
  shareMethodCard: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  shareMethodTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  shareMethodDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  // Details Modal Styles
  detailsModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  detailsModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  detailsModalContent: {
    flex: 1,
    padding: SPACING.xl,
  },
  detailSection: {
    marginBottom: SPACING.xl,
  },
  detailSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  detailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  certificationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  workingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dayText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  hoursText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  // Report Modal Styles
  reportModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  reportModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  reportModalContent: {
    flex: 1,
    padding: SPACING.xl,
  },
  reportDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  reportForm: {
    gap: SPACING.lg,
  },
  formLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  categoryOption: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  selectedCategoryOption: {
    borderColor: COLORS.text.primary,
    backgroundColor: COLORS.background.secondary,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  selectedCategoryTitle: {
    color: COLORS.text.primary,
  },
  categoryDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  formInput: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitReportButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitReportText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});