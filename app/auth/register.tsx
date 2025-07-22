import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ChefHat, Upload, FileText } from 'lucide-react-native';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export default function Register() {
  const [userType, setUserType] = useState<'customer' | 'chef'>('customer');
  const [showStateModal, setShowStateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    pincode: '',
    state: '',
    // Chef specific fields
    specialty: '',
    experience: '',
    description: '',
    // Delivery partner specific fields
    vehicleType: 'bike' as 'bike' | 'scooter' | 'car' | 'bicycle',
    vehicleNumber: '',
    drivingLicense: '',
  });
  const [documents, setDocuments] = useState({
    identity: null,
    foodSafety: null,
    addressProof: null,
  });
  
  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Basic validation
    const requiredFields = userType === 'customer' 
      ? ['name', 'email', 'password', 'phone', 'address', 'pincode', 'state']
      : userType === 'chef'
      ? ['name', 'email', 'password', 'phone', 'address', 'pincode', 'state', 'specialty', 'experience']
      : ['name', 'email', 'password', 'phone', 'address', 'pincode', 'state', 'vehicleType', 'vehicleNumber', 'drivingLicense'];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if ((userType === 'chef' || userType === 'delivery_partner') && (!documents.identity)) {
      Alert.alert('Error', 'Please upload required documents');
      return;
    }

    if (userType === 'chef' && !documents.foodSafety) {
      Alert.alert('Error', 'Please upload FSSAI license for chef registration');
      return;
    }

    if (userType === 'delivery_partner' && (!documents.drivingLicense || !documents.vehicleRegistration)) {
      Alert.alert('Error', 'Please upload driving license and vehicle registration');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        ...formData,
        role: userType,
      });
      
      const message = userType === 'chef' 
        ? 'Registration successful! Please wait for admin approval before you can start selling.'
        : 'Registration successful! You can now start ordering delicious homemade food.';
        
      Alert.alert('Welcome to HomeChef!', message, [
        { text: 'Continue', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const DocumentUpload = ({ label, required = false }: { label: string; required?: boolean }) => (
    <View style={styles.documentUpload}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      </View>
      <TouchableOpacity style={styles.uploadButton}>
        <Upload size={20} color="#FF6B35" />
        <Text style={styles.uploadButtonText}>Choose File</Text>
      </TouchableOpacity>
    </View>
  );

  const StatePickerModal = () => (
    <Modal visible={showStateModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select State</Text>
          <TouchableOpacity onPress={() => setShowStateModal(false)}>
            <Text style={styles.modalCloseText}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.stateList}>
          {INDIAN_STATES.map((state, index) => (
            <TouchableOpacity
              key={index}
              style={styles.stateItem}
              onPress={() => {
                handleInputChange('state', state);
                setShowStateModal(false);
              }}
            >
              <Text style={[
                styles.stateText,
                formData.state === state && styles.selectedStateText
              ]}>
                {state}
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
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ChefHat size={40} color="#FF6B35" />
          </View>
          <Text style={styles.title}>Join HomeChef</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <View style={styles.form}>
          {/* User Type Selection */}
          <View style={styles.userTypeSelector}>
            <Text style={styles.sectionTitle}>I want to:</Text>
            <View style={styles.userTypeOptions}>
              <TouchableOpacity
                style={[styles.roleOption, userType === 'customer' && styles.selectedRole]}
                onPress={() => setUserType('customer')}
              >
                <Text style={styles.roleEmoji}>🍽️</Text>
                <Text style={[styles.roleText, userType === 'customer' && styles.selectedRoleText]}>
                  Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, userType === 'chef' && styles.selectedRole]}
                onPress={() => setUserType('chef')}
              >
                <Text style={styles.roleEmoji}>👨‍🍳</Text>
                <Text style={[styles.roleText, userType === 'chef' && styles.selectedRoleText]}>
                  Chef
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, userType === 'delivery_partner' && styles.selectedRole]}
                onPress={() => router.push('/auth/delivery-onboarding')}
              >
                <Text style={styles.roleEmoji}>🚚</Text>
                <Text style={[styles.roleText, userType === 'delivery_partner' && styles.selectedRoleText]}>
                  Delivery
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Create a password"
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Address Information */}
          <Text style={styles.sectionTitle}>Address Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Complete Address <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your complete address"
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Pincode <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={formData.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                placeholder="Pincode"
                keyboardType="numeric"
                maxLength={6}
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowStateModal(true)}
              >
                <Text style={formData.state ? styles.inputText : styles.placeholder}>
                  {formData.state || 'Select State'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chef Specific Fields */}
          {(userType === 'chef' || userType === 'delivery_partner') && (
            <>
              <Text style={styles.sectionTitle}>
                {userType === 'chef' ? 'Chef Information' : 'Delivery Partner Information'}
              </Text>

              {userType === 'chef' && (
                <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialty <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.specialty}
                  onChangeText={(value) => handleInputChange('specialty', value)}
                  placeholder="e.g., North Indian, South Indian, Punjabi"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Experience <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.experience}
                  onChangeText={(value) => handleInputChange('experience', value)}
                  placeholder="e.g., 5 years"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Tell us about your cooking style and specialties..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>
                </>
              )}

              {userType === 'delivery_partner' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Vehicle Type <Text style={styles.required}>*</Text></Text>
                    <View style={styles.vehicleTypeSelector}>
                      {[
                        { id: 'bike', label: 'Motorcycle', emoji: '🏍️' },
                        { id: 'scooter', label: 'Scooter', emoji: '🛵' },
                        { id: 'car', label: 'Car', emoji: '🚗' },
                        { id: 'bicycle', label: 'Bicycle', emoji: '🚲' },
                      ].map((vehicle) => (
                        <TouchableOpacity
                          key={vehicle.id}
                          style={[
                            styles.vehicleTypeOption,
                            formData.vehicleType === vehicle.id && styles.selectedVehicleType
                          ]}
                          onPress={() => handleInputChange('vehicleType', vehicle.id)}
                        >
                          <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                          <Text style={[
                            styles.vehicleTypeText,
                            formData.vehicleType === vehicle.id && styles.selectedVehicleTypeText
                          ]}>
                            {vehicle.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Vehicle Number <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      value={formData.vehicleNumber}
                      onChangeText={(value) => handleInputChange('vehicleNumber', value)}
                      placeholder="e.g., MH12AB1234"
                      autoCapitalize="characters"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Driving License Number <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      value={formData.drivingLicense}
                      onChangeText={(value) => handleInputChange('drivingLicense', value)}
                      placeholder="Enter your driving license number"
                      autoCapitalize="characters"
                      placeholderTextColor="#999"
                    />
                  </View>
                </>
              )}

              {/* Document Upload Section */}
              <Text style={styles.sectionTitle}>Required Documents</Text>
              
              <DocumentUpload label="Identity Proof (Aadhaar/PAN/Voter ID)" required />
              {userType === 'chef' && (
                <DocumentUpload label="Food Safety Certificate (FSSAI License)" required />
              )}
              {userType === 'delivery_partner' && (
                <>
                  <DocumentUpload label="Driving License" required />
                  <DocumentUpload label="Vehicle Registration Certificate" required />
                  <DocumentUpload label="Vehicle Insurance" required />
                </>
              )}
              <DocumentUpload label="Address Proof (Utility Bill/Rent Agreement)" />

              <View style={styles.documentNote}>
                <FileText size={16} color="#7F8C8D" />
                <Text style={styles.documentNoteText}>
                  All documents will be verified before account approval. 
                  Please ensure all documents are clear and valid. 
                  {userType === 'delivery_partner' && 'Background verification will be conducted for delivery partners.'}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading 
                ? 'Creating Account...' 
                : (userType === 'chef' || userType === 'delivery_partner' ? 'Submit Application' : 'Create Account')
              }
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <StatePickerModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF5F0',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    marginTop: 20,
  },
  userTypeSelector: {
    marginBottom: 10,
  },
  userTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedRole: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
    elevation: 2,
    shadowOpacity: 0.15,
  },
  roleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F8C8D',
    textAlign: 'center',
  },
  selectedRoleText: {
    color: '#FF6B35',
  },
  vehicleTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vehicleTypeOption: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedVehicleType: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  vehicleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  vehicleTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedVehicleTypeText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
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
  documentUpload: {
    marginBottom: 15,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
  },
  documentNote: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  documentNoteText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#7F8C8D',
    flex: 1,
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  footerLink: {
    fontSize: 16,
    color: '#FF6B35',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  stateList: {
    flex: 1,
  },
  stateItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stateText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedStateText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  vehicleTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vehicleTypeOption: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedVehicleType: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  vehicleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  vehicleTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedVehicleTypeText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});