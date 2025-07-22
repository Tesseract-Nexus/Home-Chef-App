import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, RefreshControl, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Heart, Filter, Clock, Award, Truck } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { getResponsiveDimensions, getLayoutStyles } from '@/utils/responsive';

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
  {
    id: 4,
    name: 'Rajesh Kumar',
    specialty: 'Bengali Cuisine',
    cuisineTypes: ['bengali'],
    rating: 4.6,
    reviewCount: 98,
    location: 'Kolkata',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    dishes: ['Fish Curry', 'Rasgulla', 'Mishti Doi'],
    deliveryTime: '40-55 min',
    deliveryFee: 35,
    minOrder: 220,
    isOpen: true,
    discount: '10% OFF',
    badges: ['Authentic', 'Sweet Specialist'],
    distance: '2.8 km',
  },
  {
    id: 5,
    name: 'Harpreet Singh',
    specialty: 'Punjabi Cuisine',
    cuisineTypes: ['punjabi', 'north_indian'],
    rating: 4.9,
    reviewCount: 312,
    location: 'Amritsar',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    dishes: ['Makki di Roti', 'Sarson da Saag', 'Lassi'],
    deliveryTime: '25-40 min',
    deliveryFee: 20,
    minOrder: 180,
    isOpen: true,
    discount: null,
    badges: ['Top Rated', 'Traditional'],
    distance: '1.5 km',
  },
];

const CATEGORIES = [
  { id: 'north_indian', name: 'North Indian', emoji: '🍛', color: '#FF6B35' },
  { id: 'south_indian', name: 'South Indian', emoji: '🥞', color: '#4CAF50' },
  { id: 'gujarati', name: 'Gujarati', emoji: '🍽️', color: '#2196F3' },
  { id: 'bengali', name: 'Bengali', emoji: '🐟', color: '#9C27B0' },
  { id: 'punjabi', name: 'Punjabi', emoji: '🫓', color: '#FF9800' },
  { id: 'street_food', name: 'Street Food', emoji: '🌮', color: '#E91E63' },
];

const QUICK_FILTERS = [
  { id: 'rating', label: 'Top Rated', icon: Star },
  { id: 'fast', label: 'Fast Delivery', icon: Truck },
  { id: 'offers', label: 'Offers', icon: Award },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
];

export default function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Mumbai, 400001');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteChefs, setFavoriteChefs] = useState<number[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();
  const router = useRouter();
  const { isWeb, isDesktop } = getResponsiveDimensions();

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
    
    // Animate content refresh
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [fadeAnim]);

  const toggleFavorite = (chefId: number) => {
    setFavoriteChefs(prev => 
      prev.includes(chefId) 
        ? prev.filter(id => id !== chefId)
        : [...prev, chefId]
    );
  };

  const getFilteredChefs = () => {
    let filtered = FEATURED_CHEFS;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(chef => 
        chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.dishes.some(dish => dish.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected cuisine
    if (selectedCuisine) {
      filtered = filtered.filter(chef => 
        chef.cuisineTypes.includes(selectedCuisine)
      );
    }

    // Apply quick filters
    if (selectedFilter) {
      switch (selectedFilter) {
        case 'rating':
          filtered = filtered.filter(chef => chef.rating >= 4.5);
          break;
        case 'fast':
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

  console.log('Current filters:', { selectedCuisine, selectedFilter, searchQuery });
  console.log('Filtered chefs:', filteredChefs.length, 'out of', FEATURED_CHEFS.length);

  const renderChefCard = (chef: typeof FEATURED_CHEFS[0]) => (
    <View key={chef.id} style={[styles.chefCard, !chef.isOpen && styles.closedChef]}>
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
            size={20} 
            color={favoriteChefs.includes(chef.id) ? "#FF6B35" : "#FFF"} 
            fill={favoriteChefs.includes(chef.id) ? "#FF6B35" : "transparent"}
          />
        </TouchableOpacity>
        {!chef.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chefInfo}>
        <View style={styles.chefHeader}>
          <View style={styles.chefTitleSection}>
            <Text style={styles.chefName}>{chef.name}</Text>
            <Text style={styles.chefSpecialty}>{chef.specialty}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{chef.rating}</Text>
            <Text style={styles.reviewCount}>({chef.reviewCount})</Text>
          </View>
        </View>

        <View style={styles.badgesContainer}>
          {chef.badges.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={12} color="#666" />
          <Text style={styles.location}>{chef.location}</Text>
          <Text style={styles.distance}>• {chef.distance}</Text>
        </View>

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryItem}>
            <Clock size={12} color="#666" />
            <Text style={styles.deliveryText}>{chef.deliveryTime}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Truck size={12} color="#666" />
            <Text style={styles.deliveryText}>₹{chef.deliveryFee}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Text style={styles.minOrderText}>Min ₹{chef.minOrder}</Text>
          </View>
        </View>

        <View style={styles.dishesContainer}>
          {chef.dishes.slice(0, 3).map((dish, index) => (
            <Text key={index} style={styles.dish}>
              {dish}{index < Math.min(chef.dishes.length, 3) - 1 ? ' • ' : ''}
            </Text>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.orderButtonContainer}
          onPress={() => {
            if (chef.isOpen) {
              router.push(`/chef/${chef.id}/menu` as any);
            }
          }}
        >
          <TouchableOpacity
            style={[styles.orderButton, !chef.isOpen && styles.disabledOrderButton]}
            onPress={() => {
              if (chef.isOpen) {
                router.push(`/chef/${chef.id}/menu` as any);
              }
            }}
            disabled={!chef.isOpen}
          >
            <Text style={[styles.orderButtonText, !chef.isOpen && styles.disabledOrderButtonText]}>
              {chef.isOpen ? 'View Menu' : 'Currently Closed'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryCard = (category: typeof CATEGORIES[0]) => (
    <TouchableOpacity 
      key={category.id} 
      style={[
        styles.categoryCard, 
        { borderColor: category.color },
        selectedCuisine === category.id && { backgroundColor: category.color + '20', borderWidth: 2 }
      ]}
      onPress={() => setSelectedCuisine(selectedCuisine === category.id ? null : category.id)}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <Text style={[
        styles.categoryName,
        selectedCuisine === category.id && { color: category.color, fontWeight: '600' }
      ]}>
        {category.name}
      </Text>
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
      <filter.icon 
        size={16} 
        color={selectedFilter === filter.id ? "#FFFFFF" : "#FF6B35"} 
      />
      <Text style={[
        styles.quickFilterText,
        selectedFilter === filter.id && styles.activeQuickFilterText
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        style={[{ opacity: fadeAnim }, isWeb && styles.webScrollView]}
        contentContainerStyle={isWeb ? styles.webContentContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Enhanced Header */}
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, isDesktop && styles.desktopWelcomeText]}>
              Hello {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </Text>
            <Text style={[styles.tagline, isDesktop && styles.desktopTagline]}>
              Discover authentic homemade meals near you
            </Text>
          </View>
          <TouchableOpacity style={[styles.locationSelector, isDesktop && styles.desktopLocationSelector]}>
            <MapPin size={18} color="#FF6B35" />
            <Text style={styles.locationText}>{selectedLocation}</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Search Bar */}
        <View style={[styles.searchSection, isWeb && styles.webSearchSection]}>
          <View style={[styles.searchContainer, isDesktop && styles.desktopSearchContainer]}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for cuisine, chef, or dish..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.quickFiltersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFiltersContainer}>
            {QUICK_FILTERS.map(renderQuickFilter)}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Cuisine</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {CATEGORIES.map(renderCategoryCard)}
          </ScrollView>
        </View>

        {/* Featured Chefs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Home Chefs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            {selectedCuisine || selectedFilter || searchQuery 
              ? `Showing ${filteredChefs.length} chef(s)` 
              : 'Authentic homemade meals from certified home chefs near you'
            }
          </Text>
          
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webContainer: {
    minHeight: '100vh',
  },
  webScrollView: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  webContentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  webHeader: {
    paddingHorizontal: 40,
    paddingVertical: 30,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  desktopWelcomeText: {
    fontSize: 32,
  },
  tagline: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  desktopTagline: {
    fontSize: 18,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  desktopLocationSelector: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  webSearchSection: {
    paddingHorizontal: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desktopSearchContainer: {
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#2C3E50',
  },
  filterButton: {
    padding: 4,
  },
  quickFiltersSection: {
    paddingVertical: 12,
  },
  quickFiltersContainer: {
    paddingLeft: 20,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 4,
  },
  activeQuickFilter: {
    backgroundColor: '#FF6B35',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  activeQuickFilterText: {
    color: '#FFFFFF',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginRight: 16,
    borderWidth: 2,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  chefCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  closedChef: {
    opacity: 0.7,
  },
  chefImageContainer: {
    position: 'relative',
  },
  chefImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 50,
  },
  closedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chefInfo: {
    padding: 20,
  },
  chefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chefTitleSection: {
    flex: 1,
  },
  chefName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  chefSpecialty: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 4,
  },
  badge: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  distance: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  minOrderText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  dishesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dish: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  orderButtonContainer: {
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledOrderButton: {
    backgroundColor: '#BDC3C7',
    elevation: 0,
    shadowOpacity: 0,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledOrderButtonText: {
    color: '#7F8C8D',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gridColumn: '1 / -1', // Span all columns on web
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  chefsGrid: {
    paddingHorizontal: 20,
  },
  webChefsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: 20,
    paddingHorizontal: 0,
  },
});