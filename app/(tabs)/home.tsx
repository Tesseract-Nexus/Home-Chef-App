import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, RefreshControl, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Heart, Filter, Clock, Award, Truck, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { getResponsiveDimensions, getLayoutStyles } from '@/utils/responsive';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '@/utils/constants';
import { useToast } from '@/hooks/useToast';

const FEATURED_CHEFS = [
  {
    id: 1,
    name: 'Priya Sharma',
    specialty: 'North Indian Cuisine',
    cuisineTypes: ['north_indian', 'punjabi'],
    rating: 4.8,
    reviewCount: 234,
    location: 'Bandra West, Mumbai',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    dishes: ['Butter Chicken', 'Dal Makhani', 'Naan'],
    deliveryTime: '45-60 min',
    deliveryFee: 25,
    minOrder: 200,
    isOpen: true,
    discount: '20% OFF',
    badges: ['Top Rated', 'Fast Delivery'],
    distance: '2.3 km',
  },
  {
    id: 2,
    name: 'Meera Patel',
    specialty: 'Gujarati Thali',
    cuisineTypes: ['gujarati'],
    rating: 4.9,
    reviewCount: 189,
    location: 'Ahmedabad',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    dishes: ['Dhokla', 'Khaman', 'Gujarati Thali'],
    deliveryTime: '30-45 min',
    deliveryFee: 20,
    minOrder: 150,
    isOpen: true,
    discount: '15% OFF',
    badges: ['Authentic', 'Hygiene Certified'],
    distance: '1.8 km',
  },
  {
    id: 3,
    name: 'Lakshmi Reddy',
    specialty: 'South Indian',
    cuisineTypes: ['south_indian'],
    rating: 4.7,
    reviewCount: 156,
    location: 'Hyderabad',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    dishes: ['Dosa', 'Idli', 'Sambar'],
    deliveryTime: '35-50 min',
    deliveryFee: 30,
    minOrder: 180,
    isOpen: false,
    discount: null,
    badges: ['Traditional'],
    distance: '3.1 km',
  },
];

const CATEGORIES = [
  { id: 'offers', name: 'Offers', emoji: '🏷️' },
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢' },
  { id: 'south_indian', name: 'South Indian', emoji: '🥞' },
  { id: 'north_indian', name: 'North Indian', emoji: '🍛' },
  { id: 'gujarati', name: 'Gujarati', emoji: '🍽️' },
  { id: 'punjabi', name: 'Punjabi', emoji: '🫓' },
  { id: 'healthy', name: 'Healthy', emoji: '🥗' },
  { id: 'desserts', name: 'Desserts', emoji: '🍰' },
  { id: 'beverages', name: 'Beverages', emoji: '☕' },
];

const QUICK_FILTERS = [
  { id: 'offers', label: 'Offers' },
  { id: 'delivery_fee', label: 'Delivery Fee', icon: Truck },
  { id: 'under_30', label: 'Under 30 min', icon: Clock },
  { id: 'highest_rated', label: 'Highest rated' },
  { id: 'rating', label: 'Rating' },
  { id: 'price', label: 'Price' },
];

export default function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('4 Banbury Rd');
  const [selectedFilter, setSelectedFilter] = useState<string | null>('delivery_fee');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteChefs, setFavoriteChefs] = useState<number[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();
  const router = useRouter();
  const { isWeb, isDesktop } = getResponsiveDimensions();
  const { showSuccess, showInfo } = useToast();

  // Initialize fade animation
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleFavorite = (chefId: number) => {
    setFavoriteChefs(prev => 
      prev.includes(chefId) 
        ? prev.filter(id => id !== chefId)
        : [...prev, chefId]
    );
    
    const chef = FEATURED_CHEFS.find(c => c.id === chefId);
    if (chef) {
      const isAdding = !favoriteChefs.includes(chefId);
      if (isAdding) {
        showSuccess('Added to favorites', `${chef.name} has been added to your favorites`);
      } else {
        showInfo('Removed from favorites', `${chef.name} has been removed from your favorites`);
      }
    }
  };

  const getFilteredChefs = () => {
    let filtered = FEATURED_CHEFS;

    if (searchQuery.trim()) {
      filtered = filtered.filter(chef => 
        chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.dishes.some(dish => dish.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCuisine) {
      filtered = filtered.filter(chef => 
        chef.cuisineTypes.includes(selectedCuisine)
      );
    }

    if (selectedFilter) {
      switch (selectedFilter) {
        case 'rating':
          filtered = filtered.filter(chef => chef.rating >= 4.5);
          break;
        case 'under_30':
          filtered = filtered.filter(chef => parseInt(chef.deliveryTime.split('-')[0]) <= 30);
          break;
        case 'offers':
          filtered = filtered.filter(chef => chef.discount);
          break;
        case 'nearby':
          filtered = filtered.filter(chef => parseFloat(chef.distance.split(' ')[0]) <= 2);
          break;
      }
    }

    return filtered;
  };

  const filteredChefs = getFilteredChefs();

  const renderChefCard = (chef: typeof FEATURED_CHEFS[0]) => (
    <TouchableOpacity 
      key={chef.id} 
      style={[styles.chefCard, !chef.isOpen && styles.closedChef]}
      onPress={() => {
        if (chef.isOpen) {
          router.push(`/chef/${chef.id}/menu` as any);
        }
      }}
    >
      <View style={styles.chefImageContainer}>
        <Image source={{ uri: chef.image }} style={styles.chefImage} />
        {chef.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{chef.discount}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(chef.id)}
        >
          <Heart 
            size={18} 
            color={favoriteChefs.includes(chef.id) ? COLORS.danger : COLORS.text.tertiary} 
            fill={favoriteChefs.includes(chef.id) ? COLORS.danger : "transparent"}
          />
        </TouchableOpacity>
        {!chef.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chefInfo}>
        <Text style={styles.chefName}>{chef.name}</Text>
        
        <View style={styles.chefMeta}>
          <View style={styles.ratingContainer}>
            <Star size={12} color={COLORS.rating} fill={COLORS.rating} />
            <Text style={styles.rating}>{chef.rating}</Text>
            <Text style={styles.reviewCount}>({chef.reviewCount})</Text>
          </View>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.deliveryTime}>{chef.deliveryTime}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.deliveryFee}>₹{chef.deliveryFee} delivery</Text>
        </View>

        <Text style={styles.chefSpecialty}>{chef.specialty}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = (category: typeof CATEGORIES[0]) => (
    <TouchableOpacity 
      key={category.id} 
      style={[
        styles.categoryCard,
        selectedCuisine === category.id && styles.selectedCategoryCard
      ]}
      onPress={() => setSelectedCuisine(selectedCuisine === category.id ? null : category.id)}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );

  const renderQuickFilter = (filter: typeof QUICK_FILTERS[0]) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.quickFilterButton,
        selectedFilter === filter.id && styles.activeQuickFilter
      ]}
      onPress={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
    >
      <Text style={[
        styles.quickFilterText,
        selectedFilter === filter.id && styles.activeQuickFilterText
      ]}>
        {filter.label}
      </Text>
      {(filter.id === 'delivery_fee' || filter.id === 'rating' || filter.id === 'price') && (
        <ChevronDown size={14} color={selectedFilter === filter.id ? COLORS.text.white : COLORS.text.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <TouchableOpacity style={styles.locationSelector}>
            <Text style={styles.locationText}>{selectedLocation}</Text>
            <ChevronDown size={16} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView 
          showsVerticalScrollIndicator={false}
          style={[{ opacity: fadeAnim }, isWeb && styles.webScrollView]}
          contentContainerStyle={isWeb ? styles.webContentContainer : undefined}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Search Bar */}
          <View style={[styles.searchSection, isWeb && styles.webSearchSection]}>
            <View style={[styles.searchContainer, isDesktop && styles.desktopSearchContainer]}>
              <Search size={18} color={COLORS.text.tertiary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search HomeChef"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={COLORS.text.tertiary}
              />
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {CATEGORIES.map(renderCategoryCard)}
            </ScrollView>
          </View>

          {/* Quick Filters */}
          <View style={styles.quickFiltersSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.quickFiltersContainer}
              contentContainerStyle={styles.quickFiltersContent}
            >
              {QUICK_FILTERS.map(renderQuickFilter)}
            </ScrollView>
          </View>

          {/* Featured Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured on HomeChef</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.chefsGrid, isWeb && styles.webChefsGrid]}>
              {filteredChefs.length > 0 ? (
                filteredChefs.map(renderChefCard)
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No chefs found</Text>
                  <Text style={styles.noResultsSubtext}>Try adjusting your filters or search terms</Text>
                  <TouchableOpacity 
                    style={styles.clearFiltersButton}
                    onPress={() => {
                      setSelectedCuisine(null);
                      setSelectedFilter(null);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  webContainer: {
    minHeight: '100vh',
  },
  safeArea: {
    flex: 1,
  },
  webScrollView: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  webContentContainer: {
    paddingHorizontal: SPACING.xl,
  },
  header: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  webHeader: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    borderBottomWidth: 0,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  locationText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  webSearchSection: {
    paddingHorizontal: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  desktopSearchContainer: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingLeft: SPACING.lg,
  },
  categoriesContent: {
    paddingRight: SPACING.lg,
  },
  categoryCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginRight: SPACING.md,
    minWidth: 70,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  selectedCategoryCard: {
    backgroundColor: COLORS.text.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: SPACING.md,
  },
  quickFiltersSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quickFiltersContainer: {
    marginBottom: 0,
  },
  quickFiltersContent: {
    paddingRight: SPACING.lg,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.xxl,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    gap: SPACING.xs,
  },
  activeQuickFilter: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  quickFilterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  activeQuickFilterText: {
    color: COLORS.text.white,
  },
  chefsGrid: {
    paddingHorizontal: SPACING.lg,
  },
  webChefsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: SPACING.lg,
    paddingHorizontal: 0,
  },
  chefCard: {
    backgroundColor: COLORS.background.primary,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  closedChef: {
    opacity: 0.6,
  },
  chefImageContainer: {
    position: 'relative',
  },
  chefImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.background.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.subtle,
  },
  closedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  closedText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  chefInfo: {
    padding: SPACING.md,
  },
  chefName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  chefMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  reviewCount: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  metaDivider: {
    marginHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  deliveryFee: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  chefSpecialty: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
    gridColumn: '1 / -1',
  },
  noResultsText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  noResultsSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
  },
  clearFiltersText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});