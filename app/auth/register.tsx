import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ChefHat, Upload, FileText, ArrowLeft } from 'lucide-react-native';
import { getResponsiveDimensions } from '@/utils/responsive';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/utils/constants';

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
  const { isWeb, isDesktop } = getResponsiveDimensions();

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
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContainer, isWeb && styles.webScrollContainer]}
        >
          <View style={[styles.formContainer, isWeb && styles.webFormContainer]}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.title, isWeb && styles.webTitle]}>Create account</Text>
              <Text style={[styles.subtitle, isWeb && styles.webSubtitle]}>
                Join HomeChef and start your food journey
              </Text>
            </View>

            <View style={[styles.form, isWeb && styles.webForm]}>
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
                    <Text style={styles.roleText}>
                      Delivery
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Social Login - Moved to top */}
              <View style={styles.socialSection}>
                <Text style={styles.socialTitle}>Continue with</Text>
                <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => {/* handleSocialLogin('google') */}}
                  disabled={isLoading}
                >
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => {/* handleSocialLogin('facebook') */}}
                  disabled={isLoading}
                >
                  <View style={styles.facebookIcon}>
                    <Text style={styles.facebookIconText}>f</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => {/* handleSocialLogin('instagram') */}}
                  disabled={isLoading}
                >
                  <View style={styles.instagramIcon}>
                    <Text style={styles.instagramIconText}>📷</Text>
                  </View>
                </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Basic Information */}
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, isWeb && styles.webInput]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.text.tertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, isWeb && styles.webInput]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.text.tertiary}
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
                style={[styles.registerButton, isLoading && styles.disabledButton, isWeb && styles.webRegisterButton]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={[styles.registerButtonText, isWeb && styles.webButtonText]}>
                  {isLoading 
                    ? 'Creating Account...' 
                    : (userType === 'chef' || userType === 'delivery_partner' ? 'Submit Application' : 'Create Account')
                  }
                </Text>
              </TouchableOpacity>

              <View style={[styles.footer, isWeb && styles.webFooter]}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <StatePickerModal />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  webScrollContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  webFormContainer: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl * 2,
    maxWidth: 500,
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  header: {
    marginBottom: SPACING.xl * 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  webTitle: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  webSubtitle: {
    fontSize: FONT_SIZES.lg,
  },
  form: {
    gap: SPACING.lg,
  },
  webForm: {
    gap: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  userTypeSelector: {
    gap: SPACING.md,
  },
  userTypeOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  selectedRole: {
    backgroundColor: COLORS.background.secondary,
    borderColor: COLORS.text.primary,
  },
  roleEmoji: {
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  selectedRoleText: {
    color: COLORS.text.primary,
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
  inputGroup: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    justifyContent: 'center',
  },
  webInput: {
    paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.lg,
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
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  webRegisterButton: {
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  disabledButton: {
    backgroundColor: COLORS.text.disabled,
  },
  registerButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  webButtonText: {
    fontSize: FONT_SIZES.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  webFooter: {
    marginTop: SPACING.xl * 2,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  footerLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  socialSection: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  socialTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  socialIconButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  webSocialIconButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
  },
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  facebookIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#1877F2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIconText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instagramIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E4405F', // Fallback for non-web
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instagramIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.light,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
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
});