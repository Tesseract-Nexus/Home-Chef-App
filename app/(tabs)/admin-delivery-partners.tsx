import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X, Eye, MapPin, Star, FileText, Phone, Mail, Truck, Shield, Clock, Plus, UserPlus } from 'lucide-react-native';

const DELIVERY_PARTNER_APPLICATIONS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, 400001',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'MH12AB1234',
    experience: '3 years',
    status: 'pending',
    rating: null,
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    documents: {
      drivingLicense: { uploaded: true, verified: false },
      panCard: { uploaded: true, verified: false },
      aadhaarCard: { uploaded: true, verified: false },
      vehicleRegistration: { uploaded: true, verified: false },
      vehicleInsurance: { uploaded: true, verified: false },
      bankPassbook: { uploaded: true, verified: false },
      addressProof: { uploaded: false, verified: false },
      pccClearance: { uploaded: false, verified: false },
    },
    backgroundCheck: {
      status: 'pending',
      initiatedDate: null,
      completedDate: null,
      result: null,
    },
    emergencyContact: {
      name: 'Sunita Kumar',
      phone: '+91 98765 43211',
      relation: 'Wife',
    },
  },
  {
    id: 2,
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    location: 'Ahmedabad, 380001',
    vehicleType: 'Scooter',
    vehicleNumber: 'GJ01CD5678',
    experience: '2 years',
    status: 'approved',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    documents: {
      drivingLicense: { uploaded: true, verified: true },
      panCard: { uploaded: true, verified: true },
      aadhaarCard: { uploaded: true, verified: true },
      vehicleRegistration: { uploaded: true, verified: true },
      vehicleInsurance: { uploaded: true, verified: true },
      bankPassbook: { uploaded: true, verified: true },
      addressProof: { uploaded: true, verified: true },
      pccClearance: { uploaded: true, verified: true },
    },
    backgroundCheck: {
      status: 'cleared',
      initiatedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      result: 'clear',
    },
    emergencyContact: {
      name: 'Meera Patel',
      phone: '+91 98765 43213',
      relation: 'Mother',
    },
  },
];

export default function AdminDeliveryPartners() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'internal'>('pending');
  const [partners, setPartners] = useState(DELIVERY_PARTNER_APPLICATIONS);
  const [selectedPartner, setSelectedPartner] = useState<typeof DELIVERY_PARTNER_APPLICATIONS[0] | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [internalDrivers, setInternalDrivers] = useState([
    {
      id: 'internal_1',
      name: 'Suresh Yadav',
      email: 'suresh@homechef.com',
      phone: '+91 98765 43220',
      location: 'Mumbai, 400001',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'MH12XY9876',
      experience: '5 years',
      status: 'active',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
      joinedDate: new Date(2023, 8, 15),
      employeeId: 'EMP001',
      salary: 25000,
      isInternal: true,
      documents: {
        drivingLicense: { uploaded: true, verified: true },
        panCard: { uploaded: true, verified: true },
        aadhaarCard: { uploaded: true, verified: true },
        vehicleRegistration: { uploaded: true, verified: true },
        vehicleInsurance: { uploaded: true, verified: true },
        bankPassbook: { uploaded: true, verified: true },
        addressProof: { uploaded: true, verified: true },
        pccClearance: { uploaded: true, verified: true },
      },
      backgroundCheck: {
        status: 'cleared',
        initiatedDate: new Date(2023, 8, 10),
        completedDate: new Date(2023, 8, 14),
        result: 'clear',
      },
      emergencyContact: {
        name: 'Sunita Yadav',
        phone: '+91 98765 43221',
        relation: 'Wife',
      },
    },
  ]);
  
  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
    experience: '',
    salary: '',
    location: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const updatePartnerStatus = (id: number, newStatus: 'approved' | 'rejected') => {
    setPartners(prevPartners => 
      prevPartners.map(partner => 
        partner.id === id ? { ...partner, status: newStatus } : partner
      )
    );
  };

  const initiateBackgroundCheck = (id: number) => {
    Alert.alert(
      'Initiate Background Check',
      'This will start the Police Clearance Certificate verification process. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Initiate', 
          onPress: () => {
            setPartners(prevPartners => 
              prevPartners.map(partner => 
                partner.id === id 
                  ? { 
                      ...partner, 
                      backgroundCheck: {
                        ...partner.backgroundCheck,
                        status: 'in_progress',
                        initiatedDate: new Date(),
                      }
                    } 
                  : partner
              )
            );
            Alert.alert('Background Check Initiated', 'PCC verification process has been started.');
          }
        }
      ]
    );
  };

  const handleAddInternalDriver = () => {
    if (!driverForm.name || !driverForm.email || !driverForm.phone || !driverForm.vehicleNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newDriver = {
      id: `internal_${Date.now()}`,
      name: driverForm.name,
      email: driverForm.email,
      phone: driverForm.phone,
      location: driverForm.location,
      vehicleType: driverForm.vehicleType,
      vehicleNumber: driverForm.vehicleNumber,
      experience: driverForm.experience,
      status: 'active',
      rating: 0,
      image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
      joinedDate: new Date(),
      employeeId: `EMP${String(internalDrivers.length + 1).padStart(3, '0')}`,
      salary: parseInt(driverForm.salary) || 0,
      isInternal: true,
      documents: {
        drivingLicense: { uploaded: false, verified: false },
        panCard: { uploaded: false, verified: false },
        aadhaarCard: { uploaded: false, verified: false },
        vehicleRegistration: { uploaded: false, verified: false },
        vehicleInsurance: { uploaded: false, verified: false },
        bankPassbook: { uploaded: false, verified: false },
        addressProof: { uploaded: false, verified: false },
        pccClearance: { uploaded: false, verified: false },
      },
      backgroundCheck: {
        status: 'pending',
        initiatedDate: null,
        completedDate: null,
        result: null,
      },
      emergencyContact: {
        name: driverForm.emergencyContactName,
        phone: driverForm.emergencyContactPhone,
        relation: 'Emergency Contact',
      },
    };

    setInternalDrivers(prev => [...prev, newDriver]);
    setDriverForm({
      name: '',
      email: '',
      phone: '',
      vehicleType: 'Motorcycle',
      vehicleNumber: '',
      experience: '',
      salary: '',
      location: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    });
    setShowAddDriverModal(false);
    Alert.alert('Success', 'Internal delivery driver added successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF6B35';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#7F8C8D';
    }
  };

  const getDocumentStatus = (doc: { uploaded: boolean; verified: boolean }) => {
    if (!doc.uploaded) return { color: '#F44336', text: 'Not Uploaded', icon: X };
    if (!doc.verified) return { color: '#FF9800', text: 'Pending Verification', icon: Clock };
    return { color: '#4CAF50', text: 'Verified', icon: Check };
  };

  const renderInternalDriverCard = (driver: typeof internalDrivers[0]) => (
    <View key={driver.id} style={[styles.partnerCard, styles.internalDriverCard]}>
      <View style={styles.partnerHeader}>
        <Image source={{ uri: driver.image }} style={styles.partnerImage} />
        <View style={styles.partnerInfo}>
          <View style={styles.internalDriverHeader}>
            <Text style={styles.partnerName}>{driver.name}</Text>
            <View style={styles.internalBadge}>
              <Text style={styles.internalBadgeText}>INTERNAL</Text>
            </View>
          </View>
          <Text style={styles.employeeId}>Employee ID: {driver.employeeId}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#666" />
            <Text style={styles.location}>{driver.location}</Text>
          </View>
          <Text style={styles.vehicleInfo}>{driver.vehicleType} • {driver.vehicleNumber}</Text>
          <Text style={styles.experience}>Experience: {driver.experience}</Text>
          <Text style={styles.salary}>Salary: ₹{driver.salary.toLocaleString()}/month</Text>
          {driver.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{driver.rating}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: driver.status === 'active' ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>{driver.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Phone size={14} color="#666" />
          <Text style={styles.contactText}>{driver.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Mail size={14} color="#666" />
          <Text style={styles.contactText}>{driver.email}</Text>
        </View>
      </View>

      <View style={styles.documentsStatus}>
        <Text style={styles.documentsTitle}>Document Status</Text>
        <View style={styles.documentsGrid}>
          {Object.entries(driver.documents).slice(0, 4).map(([docType, doc]) => {
            const status = getDocumentStatus(doc);
            return (
              <View key={docType} style={styles.documentStatusItem}>
                <status.icon size={12} color={status.color} />
                <Text style={[styles.documentStatusText, { color: status.color }]}>
                  {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.backgroundCheckStatus}>
        <Shield size={16} color={driver.backgroundCheck.status === 'cleared' ? '#4CAF50' : '#FF9800'} />
        <Text style={styles.backgroundCheckText}>
          Background Check: {driver.backgroundCheck.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => {
            // Convert internal driver to partner format for modal
            const partnerFormat = {
              ...driver,
              id: parseInt(driver.id.replace('internal_', '')),
              appliedDate: driver.joinedDate,
            };
            setSelectedPartner(partnerFormat);
            setShowDetailsModal(true);
          }}
        >
          <Eye size={16} color="#2196F3" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => Alert.alert('Edit Driver', 'Edit functionality would be implemented here')}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPartnerCard = (partner: typeof DELIVERY_PARTNER_APPLICATIONS[0]) => (
    <View key={partner.id} style={styles.partnerCard}>
      <View style={styles.partnerHeader}>
        <Image source={{ uri: partner.image }} style={styles.partnerImage} />
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#666" />
            <Text style={styles.location}>{partner.location}</Text>
          </View>
          <Text style={styles.vehicleInfo}>{partner.vehicleType} • {partner.vehicleNumber}</Text>
          <Text style={styles.experience}>Experience: {partner.experience}</Text>
          {partner.rating && (
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{partner.rating}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(partner.status) }]}>
          <Text style={styles.statusText}>{partner.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Phone size={14} color="#666" />
          <Text style={styles.contactText}>{partner.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Mail size={14} color="#666" />
          <Text style={styles.contactText}>{partner.email}</Text>
        </View>
      </View>

      <View style={styles.documentsStatus}>
        <Text style={styles.documentsTitle}>Document Status</Text>
        <View style={styles.documentsGrid}>
          {Object.entries(partner.documents).slice(0, 4).map(([docType, doc]) => {
            const status = getDocumentStatus(doc);
            return (
              <View key={docType} style={styles.documentStatusItem}>
                <status.icon size={12} color={status.color} />
                <Text style={[styles.documentStatusText, { color: status.color }]}>
                  {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.backgroundCheckStatus}>
        <Shield size={16} color={partner.backgroundCheck.status === 'cleared' ? '#4CAF50' : '#FF9800'} />
        <Text style={styles.backgroundCheckText}>
          Background Check: {partner.backgroundCheck.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => {
            setSelectedPartner(partner);
            setShowDetailsModal(true);
          }}
        >
          <Eye size={16} color="#2196F3" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>

        {partner.status === 'pending' && (
          <>
            {partner.backgroundCheck.status === 'pending' && (
              <TouchableOpacity 
                style={styles.backgroundCheckButton}
                onPress={() => initiateBackgroundCheck(partner.id)}
              >
                <Shield size={16} color="#FF9800" />
                <Text style={styles.backgroundCheckButtonText}>Start PCC</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.approveButton}
              onPress={() => updatePartnerStatus(partner.id, 'approved')}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => updatePartnerStatus(partner.id, 'rejected')}
            >
              <X size={16} color="#FFFFFF" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const PartnerDetailsModal = () => (
    <Modal visible={showDetailsModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Partner Details</Text>
          <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        {selectedPartner && (
          <ScrollView style={styles.modalContent}>
            {/* Personal Information */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Personal Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Full Name:</Text>
                <Text style={styles.detailValue}>{selectedPartner.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedPartner.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{selectedPartner.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{selectedPartner.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Applied Date:</Text>
                <Text style={styles.detailValue}>{selectedPartner.appliedDate.toLocaleDateString()}</Text>
              </View>
            </View>

            {/* Vehicle Information */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Vehicle Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vehicle Type:</Text>
                <Text style={styles.detailValue}>{selectedPartner.vehicleType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registration Number:</Text>
                <Text style={styles.detailValue}>{selectedPartner.vehicleNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Experience:</Text>
                <Text style={styles.detailValue}>{selectedPartner.experience}</Text>
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Emergency Contact</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedPartner.emergencyContact.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{selectedPartner.emergencyContact.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Relation:</Text>
                <Text style={styles.detailValue}>{selectedPartner.emergencyContact.relation}</Text>
              </View>
            </View>

            {/* Document Verification */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Document Verification</Text>
              {Object.entries(selectedPartner.documents).map(([docType, doc]) => {
                const status = getDocumentStatus(doc);
                return (
                  <View key={docType} style={styles.documentDetailRow}>
                    <Text style={styles.documentName}>
                      {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <View style={styles.documentStatusContainer}>
                      <status.icon size={16} color={status.color} />
                      <Text style={[styles.documentStatusDetailText, { color: status.color }]}>
                        {status.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Background Check */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Background Verification</Text>
              <View style={styles.backgroundCheckDetail}>
                <View style={styles.backgroundCheckHeader}>
                  <Shield size={20} color={selectedPartner.backgroundCheck.status === 'cleared' ? '#4CAF50' : '#FF9800'} />
                  <Text style={styles.backgroundCheckTitle}>Police Clearance Certificate</Text>
                </View>
                <Text style={styles.backgroundCheckStatus}>
                  Status: {selectedPartner.backgroundCheck.status.replace('_', ' ').toUpperCase()}
                </Text>
                {selectedPartner.backgroundCheck.initiatedDate && (
                  <Text style={styles.backgroundCheckDate}>
                    Initiated: {selectedPartner.backgroundCheck.initiatedDate.toLocaleDateString()}
                  </Text>
                )}
                {selectedPartner.backgroundCheck.completedDate && (
                  <Text style={styles.backgroundCheckDate}>
                    Completed: {selectedPartner.backgroundCheck.completedDate.toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const AddDriverModal = () => (
    <Modal visible={showAddDriverModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Internal Delivery Driver</Text>
          <TouchableOpacity onPress={() => setShowAddDriverModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.name}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter driver's full name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email Address *</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.email}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, email: text }))}
              placeholder="driver@homechef.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number *</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.phone}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, phone: text }))}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Vehicle Type *</Text>
            <View style={styles.vehicleTypeSelector}>
              {['Motorcycle', 'Scooter', 'Car', 'Bicycle'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.vehicleTypeOption,
                    driverForm.vehicleType === type && styles.selectedVehicleType
                  ]}
                  onPress={() => setDriverForm(prev => ({ ...prev, vehicleType: type }))}
                >
                  <Text style={[
                    styles.vehicleTypeText,
                    driverForm.vehicleType === type && styles.selectedVehicleTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Vehicle Number *</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.vehicleNumber}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, vehicleNumber: text }))}
              placeholder="MH12AB1234"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Experience</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.experience}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, experience: text }))}
              placeholder="e.g., 3 years"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Monthly Salary (₹)</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.salary}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, salary: text }))}
              placeholder="25000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Location</Text>
            <TextInput
              style={styles.formInput}
              value={driverForm.location}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, location: text }))}
              placeholder="Mumbai, 400001"
            />
          </View>

          <View style={styles.emergencyContactSection}>
            <Text style={styles.emergencyContactTitle}>Emergency Contact</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Name</Text>
              <TextInput
                style={styles.formInput}
                value={driverForm.emergencyContactName}
                onChangeText={(text) => setDriverForm(prev => ({ ...prev, emergencyContactName: text }))}
                placeholder="Emergency contact name"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Phone</Text>
              <TextInput
                style={styles.formInput}
                value={driverForm.emergencyContactPhone}
                onChangeText={(text) => setDriverForm(prev => ({ ...prev, emergencyContactPhone: text }))}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addDriverButton} onPress={handleAddInternalDriver}>
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.addDriverButtonText}>Add Internal Driver</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const getFilteredData = () => {
    if (selectedTab === 'internal') {
      return { type: 'internal', data: internalDrivers };
    }
    return { type: 'external', data: partners.filter(partner => partner.status === selectedTab) };
  };

  const filteredData = getFilteredData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Partner Management</Text>
        <TouchableOpacity 
          style={styles.addInternalButton}
          onPress={() => setShowAddDriverModal(true)}
        >
          <UserPlus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['pending', 'approved', 'rejected', 'internal'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab === 'internal' ? 'Internal Drivers' : tab.charAt(0).toUpperCase() + tab.slice(1)} 
              ({tab === 'internal' ? internalDrivers.length : partners.filter(p => p.status === tab).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredData.data.length > 0 ? (
          filteredData.type === 'internal' 
            ? filteredData.data.map(renderInternalDriverCard)
            : filteredData.data.map(renderPartnerCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedTab === 'internal' ? 'No internal drivers' : `No ${selectedTab} applications`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedTab === 'internal' && 'Add internal delivery drivers to get started'}
              {selectedTab === 'pending' && 'New delivery partner applications will appear here'}
              {selectedTab === 'approved' && 'Approved delivery partners will be listed here'}
              {selectedTab === 'rejected' && 'Rejected applications will be shown here'}
            </Text>
          </View>
        )}
      </ScrollView>

      <PartnerDetailsModal />
      <AddDriverModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  partnerHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  partnerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 2,
  },
  experience: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contactInfo: {
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2C3E50',
  },
  documentsStatus: {
    marginBottom: 15,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  documentStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  backgroundCheckStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  backgroundCheckText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  backgroundCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  backgroundCheckButtonText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  rejectButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
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
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  documentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  documentName: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  documentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  documentStatusDetailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  backgroundCheckDetail: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  backgroundCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  backgroundCheckTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  backgroundCheckDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  addInternalButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  internalDriverCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  internalDriverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  internalBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  internalBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  employeeId: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  salary: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color: '#2C3E50',
  },
  vehicleTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedVehicleType: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  vehicleTypeText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedVehicleTypeText: {
    color: '#FFFFFF',
  },
  emergencyContactSection: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  emergencyContactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 12,
  },
  addDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 30,
  },
  addDriverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});