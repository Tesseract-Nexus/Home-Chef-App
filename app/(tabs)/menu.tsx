import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2, Camera, X } from 'lucide-react-native';

const SAMPLE_MENU_ITEMS = [
  {
    id: 1,
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 250,
    description: 'Rich and creamy tomato-based curry with tender chicken pieces',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    available: true,
    prepTime: '30 mins',
  },
  {
    id: 2,
    name: 'Dal Makhani',
    category: 'Vegetarian',
    price: 180,
    description: 'Creamy lentil curry slow-cooked with butter and cream',
    image: 'https://images.pexels.com/photos/5677607/pexels-photo-5677607.jpeg',
    available: true,
    prepTime: '25 mins',
  },
  {
    id: 3,
    name: 'Paneer Tikka',
    category: 'Appetizers',
    price: 220,
    description: 'Marinated cottage cheese grilled to perfection with spices',
    image: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg',
    available: false,
    prepTime: '20 mins',
  },
];

const CATEGORIES = ['All', 'Appetizers', 'Main Course', 'Vegetarian', 'Beverages', 'Desserts'];

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState(SAMPLE_MENU_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof SAMPLE_MENU_ITEMS[0] | null>(null);

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const toggleAvailability = (id: number) => {
    setMenuItems(items => 
      items.map(item => 
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const renderMenuItem = (item: typeof SAMPLE_MENU_ITEMS[0]) => (
    <View key={item.id} style={[styles.menuItem, !item.available && styles.unavailableItem]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.prepTime}>Prep time: {item.prepTime}</Text>
        
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={[styles.availabilityButton, { backgroundColor: item.available ? '#4CAF50' : '#F44336' }]}
            onPress={() => toggleAvailability(item.id)}
          >
            <Text style={styles.availabilityButtonText}>
              {item.available ? 'Available' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setEditingItem(item)}
          >
            <Edit size={16} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Trash2 size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const AddItemModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Dish</Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <TouchableOpacity style={styles.imageUpload}>
            <Camera size={32} color="#7F8C8D" />
            <Text style={styles.imageUploadText}>Add Photo</Text>
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Dish Name</Text>
            <TextInput style={styles.input} placeholder="Enter dish name" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.slice(1).map((category, index) => (
                <TouchableOpacity key={index} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter price" 
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Describe your dish..." 
              multiline 
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preparation Time</Text>
            <TextInput style={styles.input} placeholder="e.g., 30 mins" />
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Menu</Text>
        <TouchableOpacity 
          style={styles.addFab}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryFilter}
      >
        {CATEGORIES.map((category, index) => (
          <TouchableOpacity
            key={index}
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
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowAddModal(true)}
            >
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
    paddingVertical: 15,
    paddingLeft: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
  },
  activeCategoryButton: {
    backgroundColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 14,
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
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
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
    padding: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  itemCategory: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  prepTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  availabilityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  availabilityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
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
    borderColor: '#FF6B35',
  },
  categoryChipText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});