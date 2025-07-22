import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2, Camera, X, Save, Eye, EyeOff, Clock, Star, Flame } from 'lucide-react-native';

const MENU_CATEGORIES = [
  'Appetizers', 'Main Course', 'Rice', 'Breads', 'Beverages', 'Desserts', 'Snacks', 'Soups'
];

const SPICE_LEVELS = [
  { id: 'mild', label: 'Mild', emoji: '🟢', color: '#4CAF50' },
  { id: 'medium', label: 'Medium', emoji: '🟡', color: '#FF9800' },
  { id: 'hot', label: 'Hot', emoji: '🔴', color: '#F44336' },
];

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  spiceLevel: 'mild' | 'medium' | 'hot';
  preparationTime: number;
  available: boolean;
  ingredients: string[];
  allergens: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  rating: number;
  reviewCount: number;
}

const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Butter Chicken',
    description: 'Rich and creamy tomato-based curry with tender chicken pieces',
    price: 280,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 25,
    available: true,
    ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Spices'],
    allergens: ['Dairy'],
    nutritionInfo: { calories: 420, protein: 28, carbs: 12, fat: 32 },
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: '2',
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked with butter and cream',
    price: 220,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/5677607/pexels-photo-5677607.jpeg',
    isVeg: true,
    spiceLevel: 'mild',
    preparationTime: 20,
    available: true,
    ingredients: ['Black Lentils', 'Butter', 'Cream', 'Tomatoes'],
    allergens: ['Dairy'],
    nutritionInfo: { calories: 320, protein: 18, carbs: 28, fat: 18 },
    rating: 4.7,
    reviewCount: 89,
  },
];

export default function ChefMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(SAMPLE_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    isVeg: true,
    spiceLevel: 'medium',
    preparationTime: 30,
    available: true,
    ingredients: [],
    allergens: [],
  });

  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Main Course',
      isVeg: true,
      spiceLevel: 'medium',
      preparationTime: 30,
      available: true,
      ingredients: [],
      allergens: [],
    });
    setNewIngredient('');
    setNewAllergen('');
  };

  const handleAddItem = () => {
    setEditingItem(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddModal(true);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.description || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const itemData: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      price: formData.price!,
      category: formData.category!,
      image: formData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      isVeg: formData.isVeg!,
      spiceLevel: formData.spiceLevel!,
      preparationTime: formData.preparationTime!,
      available: formData.available!,
      ingredients: formData.ingredients!,
      allergens: formData.allergens!,
      nutritionInfo: formData.nutritionInfo,
      rating: editingItem?.rating || 0,
      reviewCount: editingItem?.reviewCount || 0,
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(item => item.id === editingItem.id ? itemData : item));
    } else {
      setMenuItems(prev => [...prev, itemData]);
    }

    setShowAddModal(false);
    resetForm();
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setMenuItems(prev => prev.filter(item => item.id !== id))
        }
      ]
    );
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || []
    }));
  };

  const addAllergen = () => {
    if (newAllergen.trim()) {
      setFormData(prev => ({
        ...prev,
        allergens: [...(prev.allergens || []), newAllergen.trim()]
      }));
      setNewAllergen('');
    }
  };

  const removeAllergen = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.filter((_, i) => i !== index) || []
    }));
  };

  const renderMenuItem = (item: MenuItem) => {
    const spiceConfig = SPICE_LEVELS.find(s => s.id === item.spiceLevel);

    return (
      <View key={item.id} style={[styles.menuItemCard, !item.available && styles.unavailableItem]}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleSection}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemMeta}>
                <View style={styles.vegIndicator}>
                  <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#4CAF50' : '#F44336' }]} />
                </View>
                <View style={styles.spiceIndicator}>
                  <Text style={styles.spiceEmoji}>{spiceConfig?.emoji}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.rating}>{item.rating}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailItem}>
              <Clock size={12} color="#666" />
              <Text style={styles.detailText}>{item.preparationTime} min</Text>
            </View>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          <View style={styles.itemActions}>
            <TouchableOpacity 
              style={[styles.availabilityButton, { backgroundColor: item.available ? '#4CAF50' : '#F44336' }]}
              onPress={() => toggleAvailability(item.id)}
            >
              {item.available ? <Eye size={14} color="#FFFFFF" /> : <EyeOff size={14} color="#FFFFFF" />}
              <Text style={styles.availabilityText}>
                {item.available ? 'Available' : 'Hidden'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditItem(item)}
            >
              <Edit size={14} color="#2196F3" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Trash2 size={14} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const AddItemModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Image Upload */}
          <TouchableOpacity style={styles.imageUpload}>
            <Camera size={32} color="#7F8C8D" />
            <Text style={styles.imageUploadText}>Add Photo</Text>
          </TouchableOpacity>

          {/* Basic Info */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Dish Name *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter dish name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your dish..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>Price (₹) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.price?.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: parseInt(text) || 0 }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>Prep Time (min) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.preparationTime?.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, preparationTime: parseInt(text) || 0 }))}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MENU_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.selectedCategoryChip
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    formData.category === category && styles.selectedCategoryChipText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dietary & Spice */}
          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>Dietary Type</Text>
              <View style={styles.dietaryToggle}>
                <TouchableOpacity
                  style={[styles.dietaryOption, formData.isVeg && styles.selectedDietary]}
                  onPress={() => setFormData(prev => ({ ...prev, isVeg: true }))}
                >
                  <Text style={styles.vegEmoji}>🟢</Text>
                  <Text style={[styles.dietaryText, formData.isVeg && styles.selectedDietaryText]}>Veg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dietaryOption, !formData.isVeg && styles.selectedDietary]}
                  onPress={() => setFormData(prev => ({ ...prev, isVeg: false }))}
                >
                  <Text style={styles.nonVegEmoji}>🔴</Text>
                  <Text style={[styles.dietaryText, !formData.isVeg && styles.selectedDietaryText]}>Non-Veg</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>Spice Level</Text>
              <View style={styles.spiceLevelContainer}>
                {SPICE_LEVELS.map((spice) => (
                  <TouchableOpacity
                    key={spice.id}
                    style={[
                      styles.spiceOption,
                      formData.spiceLevel === spice.id && styles.selectedSpiceOption
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, spiceLevel: spice.id as 'mild' | 'medium' | 'hot' }))}
                  >
                    <Text style={styles.spiceEmoji}>{spice.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Ingredients</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={newIngredient}
                onChangeText={setNewIngredient}
                placeholder="Add ingredient"
              />
              <TouchableOpacity style={styles.addItemButton} onPress={addIngredient}>
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.ingredients?.map((ingredient, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{ingredient}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(index)}>
                    <X size={14} color="#7F8C8D" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Allergens */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Allergens (Optional)</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={newAllergen}
                onChangeText={setNewAllergen}
                placeholder="Add allergen"
              />
              <TouchableOpacity style={styles.addItemButton} onPress={addAllergen}>
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.allergens?.map((allergen, index) => (
                <View key={index} style={[styles.tag, styles.allergenTag]}>
                  <Text style={[styles.tagText, styles.allergenTagText]}>{allergen}</Text>
                  <TouchableOpacity onPress={() => removeAllergen(index)}>
                    <X size={14} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {editingItem ? 'Update Item' : 'Add to Menu'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity style={styles.addFab} onPress={handleAddItem}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        {['All', ...MENU_CATEGORIES].map((category) => (
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.menuList}>
        {filteredItems.length > 0 ? (
          filteredItems.map(renderMenuItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items in this category</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddItem}>
              <Text style={styles.emptyStateButtonText}>Add First Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddItemModal />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addFab: {
    backgroundColor: '#FF6B35',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryFilter: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCategoryButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  menuList: {
    flex: 1,
    padding: 20,
  },
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unavailableItem: {
    opacity: 0.6,
  },
  itemImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  spiceIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spiceEmoji: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  categoryText: {
    fontSize: 12,
    color: '#7F8C8D',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    paddingVertical: 15,
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
  imageUpload: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryChipText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  dietaryToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  dietaryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  selectedDietary: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F8FF',
  },
  vegEmoji: {
    fontSize: 16,
  },
  nonVegEmoji: {
    fontSize: 16,
  },
  dietaryText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedDietaryText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  spiceLevelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  spiceOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSpiceOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
  },
  addItemButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  allergenTag: {
    backgroundColor: '#FFEBEE',
  },
  tagText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  allergenTagText: {
    color: '#F44336',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});