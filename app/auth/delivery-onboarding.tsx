import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText, Check, X, Camera, Shield, TriangleAlert as AlertTriangle } from 'lucide-react-native';

const REQUIRED_DOCUMENTS = [
  {
    id: 'driving_license',
    title: 'Driving License',
    description: 'Valid driving license for your vehicle type',
    required: true,
    icon: '🪪',
  },
  {
    id: 'pan_card',
    title: 'PAN Card',
    description: 'Permanent Account Number for tax purposes',
    required: true,
    icon: '🆔',
  },
  {
    id: 'aadhaar_card',
    title: 'Aadhaar Card',
    description: 'Government issued identity proof',
    required: true,
    icon: '🪪',
  },
  {
    id: 'vehicle_registration',
    title: 'Vehicle Registration (RC)',
    description: 'Registration certificate of your delivery vehicle',
    required: true,
    icon: '🚗',
  },
  {
    id: 'vehicle_insurance',
    title: 'Vehicle Insurance',
    description: 'Valid insurance policy for your vehicle',
    required: true,
    icon: '🛡️',
  },
  {
    id: 'bank_passbook',
    title: 'Bank Account Details',
    description: 'Bank passbook or statement for salary payments',
    required: true,
    icon: '🏦',
  },
  {
    id: 'address_proof',
    title: 'Address Proof',
    description: 'Utility bill or rent agreement (last 3 months)',
    required: false,
    icon: '🏠',
  },
];

const VEHICLE_TYPES = [
  { id: 'motorcycle', label: 'Motorcycle', emoji: '🏍️', description: 'Two-wheeler delivery' },
  { id: 'scooter', label: 'Scooter', emoji: '🛵', description: 'Electric or petrol scooter' },
  { id: 'bicycle', label: 'Bicycle', emoji: '🚲', description: 'Eco-friendly delivery' },
  { id: 'car', label: 'Car', emoji: '🚗', description: 'Four-wheeler for bulk orders' },
];

const VERIFICATION_STEPS = [
  { step: 'Document Upload', status: 'pending', description: 'Upload all required documents' },
  { step: 'Document Verification', status: 'pending', description: 'Our team verifies your documents' },
  { step: 'Background Check', status: 'pending', description: 'Police clearance certificate verification' },
  { step: 'Training & Onboarding', status: 'pending', description: 'Complete delivery partner training' },
  { step: 'Account Activation', status: 'pending', description: 'Your account will be activated' },
];

export default function DeliveryPartnerOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof REQUIRED_DOCUMENTS[0] | null>(null);
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    type: 'motorcycle',
    brand: '',
    model: '',
    year: '',
    registrationNumber: '',
    color: '',
    fuelType: 'petrol',
  });

  const [bankInfo, setBankInfo] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: boolean}>({});
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const handleDocumentUpload = (documentId: string) => {
    setUploadedDocuments(prev => ({ ...prev, [documentId]: true }));
    setShowDocumentModal(false);
    Alert.alert('Document Uploaded', 'Document uploaded successfully and sent for verification.');
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitApplication();
    }
  };

  const handleSubmitApplication = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => uploadedDocuments[doc.id]);
    
    if (uploadedRequiredDocs.length !== requiredDocs.length) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }

    if (!agreementAccepted) {
      Alert.alert('Agreement Required', 'Please accept the terms and conditions to proceed.');
      return;
    }

    Alert.alert(
      'Application Submitted!',
      'Your delivery partner application has been submitted successfully. You will receive updates via email and SMS. The verification process typically takes 3-5 business days.',
      [
        { text: 'OK', onPress: () => router.replace('/auth/login') }
      ]
    );
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>Please provide your personal details for verification</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name (as per Aadhaar) *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.fullName}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, fullName: text }))}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={personalInfo.email}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
            placeholder="your@email.com"
            keyboardType="email-address"
          />
        </View>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={personalInfo.phone}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phone: text }))}
            placeholder="10-digit number"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.dateOfBirth}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: text }))}
          placeholder="DD/MM/YYYY"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Complete Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={personalInfo.address}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, address: text }))}
          placeholder="Enter your complete address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={personalInfo.city}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, city: text }))}
            placeholder="City"
          />
        </View>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            value={personalInfo.pincode}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, pincode: text }))}
            placeholder="000000"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      </View>

      <View style={styles.emergencyContact}>
        <Text style={styles.emergencyTitle}>Emergency Contact</Text>
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Contact Name *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.emergencyContact}
              onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, emergencyContact: text }))}
              placeholder="Emergency contact name"
            />
          </View>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Contact Phone *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.emergencyPhone}
              onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, emergencyPhone: text }))}
              placeholder="10-digit number"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderVehicleInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <Text style={styles.stepDescription}>Provide details about your delivery vehicle</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <View style={styles.vehicleTypeGrid}>
          {VEHICLE_TYPES.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleTypeCard,
                vehicleInfo.type === vehicle.id && styles.selectedVehicleType
              ]}
              onPress={() => setVehicleInfo(prev => ({ ...prev, type: vehicle.id }))}
            >
              <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
              <Text style={styles.vehicleLabel}>{vehicle.label}</Text>
              <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Brand *</Text>
          <TextInput
            style={styles.input}
            value={vehicleInfo.brand}
            onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, brand: text }))}
            placeholder="e.g., Honda, Bajaj"
          />
        </View>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={styles.input}
            value={vehicleInfo.model}
            onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, model: text }))}
            placeholder="e.g., Activa, Pulsar"
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Year *</Text>
          <TextInput
            style={styles.input}
            value={vehicleInfo.year}
            onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, year: text }))}
            placeholder="2020"
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Registration Number *</Text>
          <TextInput
            style={styles.input}
            value={vehicleInfo.registrationNumber}
            onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, registrationNumber: text }))}
            placeholder="MH12AB1234"
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Color *</Text>
          <TextInput
            style={styles.input}
            value={vehicleInfo.color}
            onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, color: text }))}
            placeholder="e.g., Black, Red"
          />
        </View>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Fuel Type *</Text>
          <View style={styles.fuelTypeContainer}>
            {['petrol', 'electric', 'cng'].map((fuel) => (
              <TouchableOpacity
                key={fuel}
                style={[
                  styles.fuelTypeOption,
                  vehicleInfo.fuelType === fuel && styles.selectedFuelType
                ]}
                onPress={() => setVehicleInfo(prev => ({ ...prev, fuelType: fuel }))}
              >
                <Text style={[
                  styles.fuelTypeText,
                  vehicleInfo.fuelType === fuel && styles.selectedFuelTypeText
                ]}>
                  {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderBankInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Bank Account Details</Text>
      <Text style={styles.stepDescription}>For salary and incentive payments</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Account Holder Name *</Text>
        <TextInput
          style={styles.input}
          value={bankInfo.accountHolderName}
          onChangeText={(text) => setBankInfo(prev => ({ ...prev, accountHolderName: text }))}
          placeholder="Name as per bank account"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Account Number *</Text>
        <TextInput
          style={styles.input}
          value={bankInfo.accountNumber}
          onChangeText={(text) => setBankInfo(prev => ({ ...prev, accountNumber: text }))}
          placeholder="Enter account number"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>IFSC Code *</Text>
        <TextInput
          style={styles.input}
          value={bankInfo.ifscCode}
          onChangeText={(text) => setBankInfo(prev => ({ ...prev, ifscCode: text }))}
          placeholder="e.g., SBIN0001234"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Bank Name *</Text>
          <TextInput
            style={styles.input}
            value={bankInfo.bankName}
            onChangeText={(text) => setBankInfo(prev => ({ ...prev, bankName: text }))}
            placeholder="e.g., State Bank of India"
          />
        </View>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Branch Name *</Text>
          <TextInput
            style={styles.input}
            value={bankInfo.branchName}
            onChangeText={(text) => setBankInfo(prev => ({ ...prev, branchName: text }))}
            placeholder="Branch location"
          />
        </View>
      </View>

      <View style={styles.bankNote}>
        <Shield size={16} color="#2196F3" />
        <Text style={styles.bankNoteText}>
          Your bank details are encrypted and secure. We use this information only for salary payments and will never share it with third parties.
        </Text>
      </View>
    </View>
  );

  const renderDocumentUploadStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Document Upload</Text>
      <Text style={styles.stepDescription}>Upload clear photos of all required documents</Text>

      <View style={styles.documentsGrid}>
        {REQUIRED_DOCUMENTS.map((document) => (
          <TouchableOpacity
            key={document.id}
            style={[
              styles.documentCard,
              uploadedDocuments[document.id] && styles.uploadedDocumentCard
            ]}
            onPress={() => {
              setSelectedDocument(document);
              setShowDocumentModal(true);
            }}
          >
            <View style={styles.documentHeader}>
              <Text style={styles.documentEmoji}>{document.icon}</Text>
              {uploadedDocuments[document.id] && (
                <View style={styles.uploadedBadge}>
                  <Check size={12} color="#FFFFFF" />
                </View>
              )}
              {document.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.documentTitle}>{document.title}</Text>
            <Text style={styles.documentDescription}>{document.description}</Text>
            <View style={styles.uploadButton}>
              <Upload size={16} color={uploadedDocuments[document.id] ? "#4CAF50" : "#FF6B35"} />
              <Text style={[
                styles.uploadButtonText,
                uploadedDocuments[document.id] && styles.uploadedButtonText
              ]}>
                {uploadedDocuments[document.id] ? 'Uploaded' : 'Upload'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.verificationProcess}>
        <Text style={styles.verificationTitle}>Verification Process</Text>
        {VERIFICATION_STEPS.map((step, index) => (
          <View key={index} style={styles.verificationStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepDetails}>
              <Text style={styles.stepName}>{step.step}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.agreementSection}>
        <TouchableOpacity
          style={styles.agreementCheckbox}
          onPress={() => setAgreementAccepted(!agreementAccepted)}
        >
          <View style={[styles.checkbox, agreementAccepted && styles.checkedCheckbox]}>
            {agreementAccepted && <Check size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.agreementText}>
            I agree to the Terms & Conditions, Privacy Policy, and consent to background verification including Police Clearance Certificate (PCC) check.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.importantNote}>
        <AlertTriangle size={16} color="#FF9800" />
        <Text style={styles.importantNoteText}>
          All documents will be verified by our team. False information or fake documents will result in immediate rejection and may lead to legal action.
        </Text>
      </View>
    </View>
  );

  const DocumentUploadModal = () => (
    <Modal visible={showDocumentModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Upload {selectedDocument?.title}</Text>
          <TouchableOpacity onPress={() => setShowDocumentModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.documentPreview}>
            <Text style={styles.documentEmojiLarge}>{selectedDocument?.icon}</Text>
            <Text style={styles.documentTitleLarge}>{selectedDocument?.title}</Text>
            <Text style={styles.documentDescriptionLarge}>{selectedDocument?.description}</Text>
          </View>

          <View style={styles.uploadOptions}>
            <TouchableOpacity 
              style={styles.uploadOption}
              onPress={() => {
                if (selectedDocument) {
                  handleDocumentUpload(selectedDocument.id);
                }
              }}
            >
              <Camera size={24} color="#2196F3" />
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.uploadOption}
              onPress={() => {
                if (selectedDocument) {
                  handleDocumentUpload(selectedDocument.id);
                }
              }}
            >
              <Upload size={24} color="#4CAF50" />
              <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadGuidelines}>
            <Text style={styles.guidelinesTitle}>Upload Guidelines:</Text>
            <Text style={styles.guidelineItem}>• Ensure document is clearly visible</Text>
            <Text style={styles.guidelineItem}>• All text should be readable</Text>
            <Text style={styles.guidelineItem}>• Document should be valid and not expired</Text>
            <Text style={styles.guidelineItem}>• Photo should be well-lit and in focus</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfoStep();
      case 2: return renderVehicleInfoStep();
      case 3: return renderBankInfoStep();
      case 4: return renderDocumentUploadStep();
      default: return renderPersonalInfoStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Partner Application</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 4</Text>
      </View>

      <ScrollView style={styles.content}>
        {getStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backStepButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backStepButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 ? 'Submit Application' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <DocumentUploadModal />
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 30,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
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
  emergencyContact: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 15,
  },
  vehicleTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vehicleTypeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedVehicleType: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  vehicleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  fuelTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  fuelTypeOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedFuelType: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  fuelTypeText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedFuelTypeText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  bankNote: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    gap: 10,
  },
  bankNoteText: {
    fontSize: 14,
    color: '#1976D2',
    flex: 1,
    lineHeight: 20,
  },
  documentsGrid: {
    gap: 15,
    marginBottom: 30,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  uploadedDocumentCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  documentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  uploadedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 4,
  },
  requiredBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  requiredText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  uploadedButtonText: {
    color: '#4CAF50',
  },
  verificationProcess: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  verificationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepDetails: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  agreementSection: {
    marginBottom: 20,
  },
  agreementCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  agreementText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 20,
  },
  importantNote: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  importantNoteText: {
    fontSize: 14,
    color: '#F57C00',
    flex: 1,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 15,
  },
  backStepButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backStepButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  nextButtonText: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  documentPreview: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    marginBottom: 30,
  },
  documentEmojiLarge: {
    fontSize: 60,
    marginBottom: 15,
  },
  documentTitleLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  documentDescriptionLarge: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  uploadOptionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  uploadGuidelines: {
    backgroundColor: '#E8F4FD',
    padding: 20,
    borderRadius: 12,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
  },
});