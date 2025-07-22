import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getResponsiveDimensions } from '@/utils/responsive';
import { ArrowLeft, Star, Clock, Flame, Leaf, Plus, Minus, ShoppingCart, X, MapPin, Phone } from 'lucide-react-native';
import { useCart, SAMPLE_CHEF, MenuItem } from '@/hooks/useCart';

const MENU_CATEGORIES = ['All', 'Appetizers', 'Main Course', 'Rice', 'Breads', 'Beverages'];

const SPICE_LEVEL_CONFIG = {
  mild: { color: '#4CAF50', icon: '🟢', label: 'Mild', description: 'Light spices, family-friendly' },
  medium: { color: '#FF9800', icon: '🟡', label: 'Medium', description: 'Balanced heat, most popular' },
  hot: { color: '#F44336', icon: '🔴', label: 'Hot', description: 'Spicy kick, for spice lovers' }
};

export default function ChefMenuScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems, itemCount, currentChef, canAddFromDifferentChef } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [showItemModal, setShowItemModal] = useState(false);

  const { isWeb, isDesktop, maxWidth } = getResponsiveDimensions();
  // In a real app, fetch chef data based on id
  const chef = SAMPLE_CHEF;

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
      Alert.alert(
        'Different Chef',
        `You have items from ${currentChef?.name} in your cart. Adding items from ${chef.name} will clear your current cart.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => addToCart(chef, menuItem, qty, instructions)
          }
        ]
      );
      return;
    }

    addToCart(chef, menuItem, qty, instructions);
  };

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(getItemQuantityInCart(item.id) || 1);
    setSelectedSpiceLevel(item.spiceLevel); // Set chef's default
    setSpecialInstructions('');
    setShowItemModal(true);
  };

  const handleModalAddToCart = () => {
    if (selectedItem) {
      const customizedItem = {
        ...selectedItem,
        spiceLevel: selectedSpiceLevel
      };
      handleAddToCart(customizedItem, quantity, specialInstructions);
      setShowItemModal(false);
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
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          {!item.available && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Out of Stock</Text>
            </View>
          )}
          <View style={styles.vegIndicator}>
            {item.isVeg ? (
              <View style={styles.vegIcon}>
                <View style={styles.vegDot} />
              </View>
            ) : (
              <View style={styles.nonVegIcon}>
                <View style={styles.nonVegDot} />
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <Text style={[styles.itemName, isWeb && styles.webItemName]}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
          
          <View style={styles.itemMetaRow}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            
            <View style={styles.prepTime}>
              <Clock size={14} color="#666" />
              <Text style={styles.prepTimeText}>{item.preparationTime} min</Text>
            </View>
          </View>

          <Text style={[styles.itemDescription, isWeb && styles.webItemDescription]} numberOfLines={isWeb ? 4 : 3}>
            {item.description}
          </Text>

          <View style={styles.spiceLevelContainer}>
            <Text style={styles.spiceIcon}>{spiceConfig.icon}</Text>
            <Text style={[styles.spiceText, { color: spiceConfig.color }]}>
              {spiceConfig.label} (Chef's Default)
            </Text>
          </View>

          <View style={[styles.itemFooter, isWeb && styles.webItemFooter]}>
            {!item.available ? (
              <View style={styles.unavailableButton}>
                <Text style={styles.unavailableText}>Currently Unavailable</Text>
              </View>
            ) : cartQuantity > 0 ? (
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => {
                    const newQty = cartQuantity - 1;
                    if (newQty > 0) {
                      handleAddToCart(item, -1);
                    }
                  }}
                >
                  <Minus size={16} color="#FF6B35" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{cartQuantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleAddToCart(item, 1)}
                >
                  <Plus size={16} color="#FF6B35" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openItemModal(item)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Customize & Add</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.customizeButton}
              onPress={() => openItemModal(item)}
            >
              <Text style={styles.customizeButtonText}>Customize</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ItemDetailModal = () => (
    <Modal visible={showItemModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add to Cart</Text>
          <TouchableOpacity onPress={() => setShowItemModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        {selectedItem && (
          <ScrollView style={styles.modalContent}>
            <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
            
            <View style={styles.modalItemInfo}>
              <View style={styles.modalItemHeader}>
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                {selectedItem.isVeg ? (
                  <View style={styles.vegIcon}>
                    <Leaf size={16} color="#4CAF50" />
                  </View>
                ) : (
                  <View style={styles.nonVegIcon}>
                    <View style={styles.nonVegDot} />
                  </View>
                )}
              </View>

              <Text style={styles.modalItemPrice}>₹{selectedItem.price}</Text>
              <Text style={styles.modalItemDescription}>{selectedItem.description}</Text>

              {selectedItem.nutritionInfo && (
                <View style={styles.nutritionInfo}>
                  <Text style={styles.nutritionTitle}>Nutrition (per serving)</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{selectedItem.nutritionInfo.calories}</Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{selectedItem.nutritionInfo.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{selectedItem.nutritionInfo.carbs}g</Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{selectedItem.nutritionInfo.fat}g</Text>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                    </View>
                  </View>
                </View>
              )}

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <View style={styles.allergenInfo}>
                  <Text style={styles.allergenTitle}>Contains: {selectedItem.allergens.join(', ')}</Text>
                </View>
              )}

              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={20} color="#FF6B35" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.spiceLevelSection}>
                <Text style={styles.spiceLevelLabel}>Spice Level</Text>
                <Text style={styles.spiceLevelSubtext}>Chef's default: {SPICE_LEVEL_CONFIG[selectedItem.spiceLevel].label}</Text>
                <View style={styles.spiceLevelOptions}>
                  {Object.entries(SPICE_LEVEL_CONFIG).map(([level, config]) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.spiceLevelOption,
                        selectedSpiceLevel === level && styles.selectedSpiceLevel,
                        { borderColor: config.color }
                      ]}
                      onPress={() => setSelectedSpiceLevel(level as 'mild' | 'medium' | 'hot')}
                    >
                      <Text style={styles.spiceLevelIcon}>{config.icon}</Text>
                      <View style={styles.spiceLevelInfo}>
                        <Text style={[
                          styles.spiceLevelOptionText,
                          selectedSpiceLevel === level && { color: config.color }
                        ]}>
                          {config.label}
                        </Text>
                        <Text style={styles.spiceLevelDescription}>{config.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsLabel}>Special Instructions (Optional)</Text>
                <TextInput
                  style={styles.instructionsInput}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  placeholder="e.g., Less spicy, extra sauce..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.modalAddButton} onPress={handleModalAddToCart}>
                <Text style={styles.modalAddButtonText}>
                  Add {quantity} to Cart ({SPICE_LEVEL_CONFIG[selectedSpiceLevel].label}) - ₹{selectedItem.price * quantity}
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chef.name}</Text>
          <Text style={[styles.headerSubtitle, isWeb && styles.webHeaderSubtitle]}>{chef.specialty}</Text>
        </View>
        {itemCount > 0 && (
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart' as any)}
          >
            <ShoppingCart size={24} color="#FF6B35" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Chef Info */}
      <View style={[styles.chefInfo, isWeb && styles.webChefInfo]}>
        <Image source={{ uri: chef.image }} style={styles.chefImage} />
        <View style={styles.chefDetails}>
          <View style={styles.chefRating}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{chef.rating}</Text>
            <Text style={styles.reviewCount}>({chef.reviewCount} reviews)</Text>
          </View>
          <View style={styles.chefMeta}>
            <View style={styles.metaItem}>
              <MapPin size={14} color="#666" />
              <Text style={styles.metaText}>{chef.distance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color="#666" />
              <Text style={styles.metaText}>{chef.deliveryTime}</Text>
            </View>
          </View>
          <Text style={styles.minOrder}>Min order: ₹{chef.minOrder}</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
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

      {/* Menu Items */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={[styles.menuList, isWeb && styles.webMenuList]}
        contentContainerStyle={isWeb ? styles.webMenuContent : undefined}>
        {availableMenu.length > 0 ? (
          availableMenu.map(renderMenuItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items available in this category</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
          </View>
        )}
      </ScrollView>

      <ItemDetailModal />
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webHeader: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 2,
  },
  webHeaderSubtitle: {
    fontSize: 16,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chefInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webChefInfo: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  chefImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  chefDetails: {
    flex: 1,
  },
  chefRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  chefMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  minOrder: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  callButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
  },
  categoryFilter: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  webMenuList: {
    paddingHorizontal: 0,
  },
  webMenuContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 20,
    paddingBottom: 40,
  },
  webMenuList: {
    paddingHorizontal: 0,
  },
  webMenuContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 20,
    paddingBottom: 40,
  },
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 2,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webMenuItemCard: {
    marginBottom: 0,
  },
  unavailableItem: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 200,
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
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vegIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  vegIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  nonVegIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  itemContent: {
    padding: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 6,
  },
  webItemName: {
    fontSize: 18,
  },
  webItemDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  webItemFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
    fontWeight: '600',
    color: '#2C3E50',
  },
  reviewCount: {
    marginLeft: 2,
    fontSize: 12,
    color: '#7F8C8D',
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prepTimeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  spiceLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  spiceIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  spiceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 3,
    flex: 1,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  customizeButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  customizeButtonText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  quantityButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    paddingHorizontal: 8,
  },
  unavailableButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  spiceLevelSection: {
    marginBottom: 20,
  },
  spiceLevelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  spiceLevelSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  spiceLevelOptions: {
    gap: 12,
  },
  spiceLevelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedSpiceLevel: {
    backgroundColor: '#FFF5F0',
  },
  spiceLevelIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  spiceLevelInfo: {
    flex: 1,
  },
  spiceLevelOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  spiceLevelDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  unavailableText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
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
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalItemInfo: {
    padding: 20,
  },
  modalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 12,
  },
  modalItemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  modalItemDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  nutritionInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  allergenInfo: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  allergenTitle: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '500',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  instructionsSection: {
    marginBottom: 30,
  },
  instructionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  instructionsInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalAddButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalAddButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});