import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, X, Chrome as Home, Briefcase, Plane, Clock, CreditCard as Edit, Trash2, Check } from 'lucide-react-native';
import { useAddresses, Address } from '@/hooks/useAddresses';

const ADDRESS_TYPES = [
  { type: 'home' as const, label: 'Home', icon: Home, color: '#4CAF50' },
  { type: 'work' as const, label: 'Work', icon: Briefcase, color: '#2196F3' },
  { type: 'holiday' as const, label: 'Holiday', icon: Plane, color: '#FF9800' },
  { type: 'temporary' as const, label: 'Temporary', icon: Clock, color: '#9C27B0' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export default function AddressesScreen() {
  const { addresses, defaultAddress, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showStateModal, setShowStateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'home' as Address['type'],
    label: '',
    fullAddress: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    instructions: '',
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      type: 'home',
      label: '',
      fullAddress: '',
      landmark: '',
      pincode: '',
      city: '',
      state: '',
      instructions: '',
      isDefault: false,
    });
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      label: address.label,
      fullAddress: address.fullAddress,
      landmark: address.landmark || '',
      pincode: address.pincode,
      city: address.city,
      state: address.state,
      instructions: address.instructions || '',
      isDefault: address.isDefault,
    });
    setShowAddModal(true);
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!formData.fullAddress || !formData.pincode || !formData.city || !formData.state) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    try {
      const addressData = {
        ...formData,
        label: formData.label || ADDRESS_TYPES.find(t => t.type === formData.type)?.label || formData.type,
      };

      if (editingAddress) {
        await updateAddress(editingAddress.id, addressData);
      } else {
        await addAddress(addressData);
      }

      setShowAddModal(false);
      resetForm();
      setEditingAddress(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAddress(address.id)
        }
      ]
    );
  };

  const handleSetDefault = async (address: Address) => {
    if (!address.isDefault) {
      await setDefaultAddress(address.id);
    }
  };

  const getAddressTypeConfig = (type: Address['type']) => {
    return ADDRESS_TYPES.find(t => t.type === type) || ADDRESS_TYPES[0];
  };

  const renderAddressCard = (address: Address) => {
    const typeConfig = getAddressTypeConfig(address.type);
    const TypeIcon = typeConfig.icon;

    return (
      <View key={address.id} style={[styles.addressCard, address.isDefault && styles.defaultAddressCard]}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeSection}>
            <View style={[styles.typeIcon, { backgroundColor: typeConfig.color + '20' }]}>
              <TypeIcon size={20} color={typeConfig.color} />
            </View>
            <View style={styles.addressTitleSection}>
              <Text style={styles.addressLabel}>{address.label}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.addressActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditAddress(address)}
            >
              <Edit size={16} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteAddress(address)}
            >
              <Trash2 size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addressDetails}>
          <Text style={styles.fullAddress}>{address.fullAddress}</Text>
          {address.landmark && (
            <Text style={styles.landmark}>Near {address.landmark}</Text>
          )}
          <Text style={styles.cityState}>{address.city}, {address.state} - {address.pincode}</Text>
          {address.instructions && (
            <Text style={styles.instructions}>Instructions: {address.instructions}</Text>
          )}
        </View>

        {!address.isDefault && (
          <TouchableOpacity 
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(address)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const AddressModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Address Type Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Address Type</Text>
            <View style={styles.typeSelector}>
              {ADDRESS_TYPES.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeOption,
                      formData.type === type.type && styles.selectedTypeOption
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.type })}
                  >
                    <TypeIcon 
                      size={20} 
                      color={formData.type === type.type ? "#FFFFFF" : type.color} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === type.type && styles.selectedTypeOptionText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Custom Label */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Label (Optional)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.label}
              onChangeText={(text) => setFormData({ ...formData, label: text })}
              placeholder={`Enter custom label or leave empty for "${ADDRESS_TYPES.find(t => t.type === formData.type)?.label}"`}
            />
          </View>

          {/* Full Address */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Complete Address *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.fullAddress}
              onChangeText={(text) => setFormData({ ...formData, fullAddress: text })}
              placeholder="Enter your complete address"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Landmark */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Landmark (Optional)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.landmark}
              onChangeText={(text) => setFormData({ ...formData, landmark: text })}
              placeholder="e.g., Near Metro Station, Opposite Mall"
            />
          </View>

          {/* City and Pincode */}
          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>City *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Enter city"
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>Pincode *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.pincode}
                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          {/* State */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>State *</Text>
            <TouchableOpacity 
              style={styles.formInput}
              onPress={() => setShowStateModal(true)}
            >
              <Text style={formData.state ? styles.inputText : styles.placeholder}>
                {formData.state || 'Select State'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delivery Instructions */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Delivery Instructions (Optional)</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.instructions}
              onChangeText={(text) => setFormData({ ...formData, instructions: text })}
              placeholder="e.g., Ring the bell twice, Call when you reach"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Set as Default */}
          <TouchableOpacity 
            style={styles.defaultCheckbox}
            onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
          >
            <View style={[styles.checkbox, formData.isDefault && styles.checkedCheckbox]}>
              {formData.isDefault && <Check size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
            <Text style={styles.saveButtonText}>
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const StateModal = () => (
    <Modal visible={showStateModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select State</Text>
          <TouchableOpacity onPress={() => setShowStateModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {INDIAN_STATES.map((state, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stateItem,
                formData.state === state && styles.selectedState
              ]}
              onPress={() => {
                setFormData({ ...formData, state });
                setShowStateModal(false);
              }}
            >
              <Text style={[
                styles.stateText,
                formData.state === state && styles.selectedStateText
              ]}>
                {state}
              </Text>
              {formData.state === state && (
                <Check size={20} color="#FF6B35" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {addresses.length > 0 ? (
          <>
            {defaultAddress && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Default Address</Text>
                {renderAddressCard(defaultAddress)}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Addresses ({addresses.length})</Text>
              {addresses.map(renderAddressCard)}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={60} color="#BDC3C7" />
            <Text style={styles.emptyStateTitle}>No addresses saved</Text>
            <Text style={styles.emptyStateText}>
              Add your first address to get started with food delivery
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddAddress}>
              <Text style={styles.emptyStateButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddressModal />
      <StateModal />
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
  addButton: {
    backgroundColor: '#FF6B35',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  defaultAddressCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  addressTypeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressTitleSection: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  addressDetails: {
    marginBottom: 15,
  },
  fullAddress: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 6,
  },
  landmark: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  cityState: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  instructions: {
    fontSize: 13,
    color: '#9C27B0',
    fontStyle: 'italic',
  },
  setDefaultButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  emptyStateButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#2C3E50',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  selectedTypeOption: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  selectedTypeOptionText: {
    color: '#FFFFFF',
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedState: {
    backgroundColor: '#FFF5F0',
  },
  stateText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedStateText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});