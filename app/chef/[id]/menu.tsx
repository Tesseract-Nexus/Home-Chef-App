import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getResponsiveDimensions } from '@/utils/responsive';
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, X, MapPin, ChevronDown, Bell, BellOff, Info, Share2, EyeOff, Flag } from 'lucide-react-native';
import { useCart, SAMPLE_CHEF, MenuItem } from '@/hooks/useCart';
import { useChefSubscriptions } from '@/hooks/useChefSubscriptions';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '@/utils/constants';
import { useToast } from '@/hooks/useToast';

const MENU_CATEGORIES = ['All', 'Appetizers', 'Main Course', 'Rice', 'Breads', 'Beverages'];

const SPICE_LEVEL_CONFIG = {
  mild: { color: COLORS.success, icon: '🟢', label: 'Mild', description: 'Light spices, family-friendly' },
  medium: { color: COLORS.warning, icon: '🟡', label: 'Medium', description: 'Balanced heat, most popular' },
  hot: { color: COLORS.danger, icon: '🔴', label: 'Hot', description: 'Spicy kick, for spice lovers' }
};

export default function ChefMenuScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems, itemCount, currentChef, canAddFromDifferentChef } = useCart();
  const { subscribeToChef, unsubscribeFromChef, isSubscribedToChef } = useChefSubscriptions();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [showItemModal, setShowItemModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChefOptionsModal, setShowChefOptionsModal] = useState(false);

  const { isWeb, isDesktop } = getResponsiveDimensions();
  const chef = SAMPLE_CHEF;
  const { showSuccess, showError } = useToast();
  const isSubscribed = isSubscribedToChef(chef.id);

  const filteredMenu = selectedCategory === 'All' 
    ? chef.menu 
    : chef.menu.filter(item => item.category === selectedCategory);

  const availableMenu = filteredMenu.filter(item => item.available);

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cartItems.find(item => item.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (menuItem: MenuItem, qty: number = 1, instructions?: string) => {
    if (!canAddFromDifferentChef(chef.id)) {
      // Handle different chef scenario
      showError('Different chef', 'Please clear your cart to order from a different chef');
      return;
    }
    
    addToCart(chef, menuItem, qty, instructions);
    showSuccess('Added to cart', `${menuItem.name} has been added to your cart`);
  };

  const handleQuickAdd = (menuItem: MenuItem) => {
    if (!canAddFromDifferentChef(chef.id)) {
      showError('Different chef', 'Please clear your cart to order from a different chef');
      return;
    }
    addToCart(chef, menuItem, 1);
    showSuccess('Added to cart', `${menuItem.name} has been added to your cart`);
  };

  const openItemModal = (item: MenuItem) => {
    if (isProcessing) return; // Prevent opening while processing
    
    setSelectedItem(item);
    setQuantity(getItemQuantityInCart(item.id) || 1);
    setSelectedSpiceLevel(item.spiceLevel);
    setSpecialInstructions('');
    setShowItemModal(true);
  };

  const handleModalAddToCart = async () => {
    if (isProcessing || !selectedItem) return;
    
    setIsProcessing(true);
    
    try {
      const customizedItem = {
        ...selectedItem,
        spiceLevel: selectedSpiceLevel
      };
      
      handleAddToCart(customizedItem, quantity, specialInstructions);
      
      // Close modal and reset state
      setShowItemModal(false);
      setSelectedItem(null);
      setQuantity(1);
      setSpecialInstructions('');
      setSelectedSpiceLevel('medium');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    if (selectedItem) {
      setShowItemModal(false);
      setSelectedItem(null);
      setQuantity(1);
      setSpecialInstructions('');
      setSelectedSpiceLevel('medium');
    }
  };

  const handleSubscriptionToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromChef(chef.id);
        showSuccess('Unsubscribed', `You will no longer receive notifications from ${chef.name}`);
      } else {
        await subscribeToChef(chef.id, chef.name, chef.image);
        showSuccess('Subscribed!', `You'll now get notified about new dishes and offers from ${chef.name}`);
      }
    } catch (error) {
      showError('Error', 'Failed to update subscription. Please try again.');
    }
  };
  const renderMenuItem = (item: MenuItem) => {
    const cartQuantity = getItemQuantityInCart(item.id);
    const spiceConfig = SPICE_LEVEL_CONFIG[item.spiceLevel];

    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.menuItemCard, !item.available && styles.unavailableItem]}
        onPress={() => openItemModal(item)}
        disabled={!item.available}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleSection}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          </View>
          
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.itemMeta}>
            <View style={styles.ratingContainer}>
              <Star size={12} color={COLORS.rating} fill={COLORS.rating} />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <View style={styles.prepTime}>
              <Clock size={12} color={COLORS.text.tertiary} />
              <Text style={styles.prepTimeText}>{item.preparationTime} min</Text>
            </View>
          </View>

          <View style={styles.spiceLevelContainer}>
            <Text style={styles.spiceIcon}>{spiceConfig.icon}</Text>
            <Text style={styles.spiceText}>{spiceConfig.label}</Text>
          </View>
        </View>

        <View style={styles.itemImageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          {!item.available && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Out of Stock</Text>
            </View>
          )}
          <View style={styles.vegIndicator}>
            <View style={[styles.vegDot, { backgroundColor: item.isVeg ? COLORS.success : COLORS.danger }]} />
          </View>
          {item.available && (
            <TouchableOpacity 
              style={styles.quickAddButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickAdd(item);
              }}
            >
              <Plus size={16} color={COLORS.text.white} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ItemDetailModal = () => (
    <Modal 
      visible={showItemModal} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={handleCloseModal}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCloseModal}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {selectedItem && (
          <ScrollView style={styles.modalContent}>
            <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
            
            <View style={styles.modalItemInfo}>
              <Text style={styles.modalItemName}>{selectedItem.name}</Text>
              <Text style={styles.modalItemDescription}>{selectedItem.description}</Text>

              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => {
                      if (!isProcessing) {
                        setQuantity(Math.max(1, quantity - 1));
                      }
                    }}
                    disabled={isProcessing}
                  >
                    <Minus size={18} color={COLORS.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => {
                      if (!isProcessing) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    <Plus size={18} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.spiceLevelSection}>
                <Text style={styles.spiceLevelLabel}>Spice Level</Text>
                <View style={styles.spiceLevelOptions}>
                  {Object.entries(SPICE_LEVEL_CONFIG).map(([level, config]) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.spiceLevelOption,
                        selectedSpiceLevel === level && styles.selectedSpiceLevel
                      ]}
                      onPress={() => {
                        if (!isProcessing) {
                          setSelectedSpiceLevel(level as 'mild' | 'medium' | 'hot');
                        }
                      }}
                      disabled={isProcessing}
                    >
                      <Text style={styles.spiceLevelIcon}>{config.icon}</Text>
                      <Text style={styles.spiceLevelOptionText}>{config.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsLabel}>Special Instructions</Text>
                <TextInput
                  style={styles.instructionsInput}
                  value={specialInstructions}
                  onChangeText={(text) => {
                    if (!isProcessing) {
                      setSpecialInstructions(text);
                    }
                  }}
                  placeholder="Add cooking instructions..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={COLORS.text.tertiary}
                  editable={!isProcessing}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.modalAddButton,
                  isProcessing && styles.disabledModalButton
                ]} 
                onPress={handleModalAddToCart}
                disabled={isProcessing}
              >
                <Text style={styles.modalAddButtonText}>
                  {isProcessing 
                    ? 'Adding to cart...' 
                    : `Add ${quantity} to order • ₹${selectedItem.price * quantity}`
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{chef.name}</Text>
            <View style={styles.headerMeta}>
              <View style={styles.ratingContainer}>
                <Star size={14} color={COLORS.rating} fill={COLORS.rating} />
                <Text style={styles.rating}>{chef.rating}</Text>
              </View>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.deliveryTime}>{chef.deliveryTime}</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.distance}>{chef.distance}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.subscribeButton, isSubscribed && styles.subscribedButton]}
              onPress={handleSubscriptionToggle}
            >
              {isSubscribed ? (
                <BellOff size={16} color={COLORS.text.white} />
              ) : (
                <Bell size={16} color={COLORS.text.primary} />
              )}
              <Text style={[
                styles.subscribeButtonText,
                isSubscribed && styles.subscribedButtonText
              ]}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.moreOptionsButton}
              onPress={() => setShowChefOptionsModal(true)}
            >
              <View style={styles.threeDotIcon}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </TouchableOpacity>
          </View>
          {itemCount > 0 && (
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push('/cart' as any)}
            >
              <ShoppingCart size={20} color={COLORS.text.primary} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryContent}
          >
            {MENU_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.activeCategoryButtonText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={[styles.menuList, isWeb && styles.webMenuList]}
          contentContainerStyle={isWeb ? styles.webMenuContent : styles.mobileMenuContent}
        >
          {availableMenu.length > 0 ? (
            availableMenu.map(renderMenuItem)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No items available</Text>
              <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
            </View>
          )}
        </ScrollView>

        <ItemDetailModal />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  webHeader: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    gap: SPACING.sm,
    minWidth: 100,
    justifyContent: 'center',
  },
  subscribedButton: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  subscribeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  subscribedButtonText: {
    color: COLORS.text.white,
  },
  moreOptionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  threeDotIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8E8E93',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  metaDivider: {
    marginHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  distance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  cartButton: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.text.primary,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  categorySection: {
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  categoryFilter: {
    paddingVertical: SPACING.lg,
  },
  categoryContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: COLORS.text.white,
  },
  menuList: {
    flex: 1,
  },
  webMenuList: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  mobileMenuContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  webMenuContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  menuItemCard: {
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingVertical: SPACING.xl,
    flexDirection: 'row',
  },
  unavailableItem: {
    opacity: 0.5,
  },
  itemContent: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  itemHeader: {
    marginBottom: SPACING.sm,
  },
  itemTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.md,
  },
  itemPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  itemDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  itemMeta: {
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
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  reviewCount: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepTimeText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  spiceLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spiceIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  spiceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  unavailableText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  vegIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.text.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalItemInfo: {
    padding: SPACING.xl,
  },
  modalItemName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  modalItemDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  quantitySection: {
    marginBottom: SPACING.xl,
  },
  quantityLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
  },
  spiceLevelSection: {
    marginBottom: SPACING.xl,
  },
  spiceLevelLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  spiceLevelOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  spiceLevelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    gap: SPACING.sm,
  },
  selectedSpiceLevel: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  spiceLevelIcon: {
    fontSize: 14,
  },
  spiceLevelOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  instructionsSection: {
    marginBottom: SPACING.xl,
  },
  instructionsLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  instructionsInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  modalAddButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  modalAddButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  disabledModalButton: {
    backgroundColor: COLORS.text.disabled,
    opacity: 0.6,
  },
  // Chef Options Bottom Sheet Styles
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  chefOptionsBottomSheet: {
    backgroundColor: '#FFFFFF',
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
  chefOptionsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chefOptionsName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  chefOptionsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chefOptionsRating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 4,
  },
  chefOptionsReviewCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsMetaDivider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsDeliveryTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsDistance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  chefOptionsLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsSpecialty: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsContainer: {
    paddingTop: 8,
  },
  chefOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chefOptionIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefOptionText: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
  },
  chefReportOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chefReportContent: {
    flex: 1,
  },
  chefReportTitle: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
    marginBottom: 4,
  },
  chefReportSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  // Chef Options Bottom Sheet Styles
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  chefOptionsBottomSheet: {
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
  chefOptionsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chefOptionsName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  chefOptionsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chefOptionsRating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 4,
  },
  chefOptionsReviewCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsMetaDivider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsDeliveryTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsDistance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  chefOptionsLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsSpecialty: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsContainer: {
    paddingTop: 8,
  },
  chefOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chefOptionIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefOptionText: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
  },
  chefReportOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chefReportContent: {
    flex: 1,
  },
  chefReportTitle: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
    marginBottom: 4,
  },
  chefReportSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  // Chef Options Bottom Sheet Styles
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  chefOptionsBottomSheet: {
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
  chefOptionsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chefOptionsName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  chefOptionsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chefOptionsRating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 4,
  },
  chefOptionsReviewCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsMetaDivider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsDeliveryTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsDistance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  chefOptionsLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsSpecialty: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chefOptionsContainer: {
    paddingTop: 8,
  },
  chefOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chefOptionIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefOptionText: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
  },
  chefReportOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chefReportContent: {
    flex: 1,
  },
  chefReportTitle: {
    fontSize: 16,
    color: '#545454',
    fontWeight: '600',
    marginBottom: 4,
  },
  chefReportSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});