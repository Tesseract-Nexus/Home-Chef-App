import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, CreditCard as Edit, Trash2, Shield, Users, Settings, Eye, EyeOff, Mail, Phone, MapPin, Calendar, UserCheck, UserX, Clock, CheckCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/utils/constants';
import { useWorkingHours } from '@/hooks/useWorkingHours';

const STAFF_ROLES = [
  { id: 'admin', label: 'Admin', permissions: ['all'], color: '#F44336' },
  { id: 'manager', label: 'Manager', permissions: ['chef_management', 'delivery_management', 'customer_support'], color: '#FF9800' },
  { id: 'support', label: 'Customer Support', permissions: ['customer_support', 'order_management'], color: '#2196F3' },
  { id: 'finance', label: 'Finance', permissions: ['payout_management', 'financial_reports'], color: '#4CAF50' },
  { id: 'operations', label: 'Operations', permissions: ['chef_management', 'delivery_management'], color: '#9C27B0' },
];

const PERMISSIONS = [
  { id: 'chef_management', label: 'Chef Management', description: 'Approve/reject chefs, manage chef profiles' },
  { id: 'delivery_management', label: 'Delivery Management', description: 'Manage delivery partners and routes' },
  { id: 'customer_support', label: 'Customer Support', description: 'Handle customer queries and complaints' },
  { id: 'order_management', label: 'Order Management', description: 'View and manage all orders' },
  { id: 'payout_management', label: 'Payout Management', description: 'Process payments and payouts' },
  { id: 'financial_reports', label: 'Financial Reports', description: 'Access financial data and reports' },
  { id: 'platform_settings', label: 'Platform Settings', description: 'Modify platform configurations' },
  { id: 'user_management', label: 'User Management', description: 'Manage staff accounts and permissions' },
];

const SAMPLE_STAFF = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@homechef.com',
    phone: '+91 98765 43210',
    role: 'manager',
    department: 'Operations',
    joinDate: new Date(2023, 5, 15),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'active',
    permissions: ['chef_management', 'delivery_management', 'customer_support'],
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    location: 'Mumbai Office',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@homechef.com',
    phone: '+91 98765 43211',
    role: 'support',
    department: 'Customer Success',
    joinDate: new Date(2023, 8, 20),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    status: 'active',
    permissions: ['customer_support', 'order_management'],
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    location: 'Delhi Office',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit@homechef.com',
    phone: '+91 98765 43212',
    role: 'finance',
    department: 'Finance',
    joinDate: new Date(2023, 3, 10),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'inactive',
    permissions: ['payout_management', 'financial_reports'],
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    location: 'Bangalore Office',
  },
];

export default function AdminStaffManagement() {
  const { changeRequests, approveScheduleChange, rejectScheduleChange } = useWorkingHours();
  const [staff, setStaff] = useState(SAMPLE_STAFF);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<typeof SAMPLE_STAFF[0] | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'inactive' | 'all'>('all');
  const [showScheduleRequestsModal, setShowScheduleRequestsModal] = useState(false);
  
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'support',
    department: '',
    permissions: [] as string[],
    location: '',
  });

  const resetForm = () => {
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      role: 'support',
      department: '',
      permissions: [],
      location: '',
    });
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditStaff = (staffMember: typeof SAMPLE_STAFF[0]) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      department: staffMember.department,
      permissions: staffMember.permissions,
      location: staffMember.location,
    });
    setShowAddModal(true);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const staffData = {
      id: editingStaff?.id || Date.now().toString(),
      name: staffForm.name,
      email: staffForm.email,
      phone: staffForm.phone,
      role: staffForm.role,
      department: staffForm.department,
      permissions: staffForm.permissions,
      location: staffForm.location,
      joinDate: editingStaff?.joinDate || new Date(),
      lastLogin: editingStaff?.lastLogin || new Date(),
      status: editingStaff?.status || 'active',
      image: editingStaff?.image || 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    };

    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? staffData : s));
    } else {
      setStaff(prev => [...prev, staffData]);
    }

    setShowAddModal(false);
    resetForm();
    setEditingStaff(null);
    Alert.alert('Success', `Staff member ${editingStaff ? 'updated' : 'added'} successfully!`);
  };

  const handleDeleteStaff = (id: string) => {
    Alert.alert(
      'Delete Staff Member',
      'Are you sure you want to delete this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setStaff(prev => prev.filter(s => s.id !== id))
        }
      ]
    );
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  const togglePermission = (permission: string) => {
    setStaffForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getRoleColor = (role: string) => {
    return STAFF_ROLES.find(r => r.id === role)?.color || '#7F8C8D';
  };

  const getRoleLabel = (role: string) => {
    return STAFF_ROLES.find(r => r.id === role)?.label || role;
  };

  const handleApproveScheduleChange = async (requestId: string, notes?: string) => {
    const success = await approveScheduleChange(requestId, notes);
    if (success) {
      Alert.alert('Success', 'Schedule change request approved successfully!');
    }
  };

  const handleRejectScheduleChange = async (requestId: string, reason: string) => {
    const success = await rejectScheduleChange(requestId, reason);
    if (success) {
      Alert.alert('Success', 'Schedule change request rejected.');
    }
  };
  const getFilteredStaff = () => {
    if (selectedTab === 'all') return staff;
    return staff.filter(s => s.status === selectedTab);
  };

  const renderStaffCard = (staffMember: typeof SAMPLE_STAFF[0]) => (
    <View key={staffMember.id} style={styles.staffCard}>
      <View style={styles.staffHeader}>
        <Image source={{ uri: staffMember.image }} style={styles.staffImage} />
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>{staffMember.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(staffMember.role) }]}>
            <Text style={styles.roleText}>{getRoleLabel(staffMember.role)}</Text>
          </View>
          <Text style={styles.department}>{staffMember.department}</Text>
        </View>
        <View style={styles.staffActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditStaff(staffMember)}
          >
            <Edit size={16} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteStaff(staffMember.id)}
          >
            <Trash2 size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.staffDetails}>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Mail size={14} color="#666" />
            <Text style={styles.contactText}>{staffMember.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={14} color="#666" />
            <Text style={styles.contactText}>{staffMember.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <MapPin size={14} color="#666" />
            <Text style={styles.contactText}>{staffMember.location}</Text>
          </View>
        </View>

        <View style={styles.staffMeta}>
          <View style={styles.metaItem}>
            <Calendar size={14} color="#666" />
            <Text style={styles.metaText}>Joined: {staffMember.joinDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color="#666" />
            <Text style={styles.metaText}>
              Last login: {staffMember.lastLogin.toLocaleDateString()} at {staffMember.lastLogin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={styles.permissionsSection}>
          <Text style={styles.permissionsTitle}>Permissions:</Text>
          <View style={styles.permissionsList}>
            {staffMember.permissions.map((permission, index) => (
              <View key={index} style={styles.permissionChip}>
                <Text style={styles.permissionText}>
                  {PERMISSIONS.find(p => p.id === permission)?.label || permission}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statusSection}>
          <TouchableOpacity 
            style={[
              styles.statusButton,
              { backgroundColor: staffMember.status === 'active' ? '#4CAF50' : '#F44336' }
            ]}
            onPress={() => toggleStaffStatus(staffMember.id)}
          >
            {staffMember.status === 'active' ? (
              <UserCheck size={16} color="#FFFFFF" />
            ) : (
              <UserX size={16} color="#FFFFFF" />
            )}
            <Text style={styles.statusButtonText}>
              {staffMember.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const AddStaffModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              value={staffForm.name}
              onChangeText={(text) => setStaffForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email Address *</Text>
            <TextInput
              style={styles.formInput}
              value={staffForm.email}
              onChangeText={(text) => setStaffForm(prev => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number *</Text>
            <TextInput
              style={styles.formInput}
              value={staffForm.phone}
              onChangeText={(text) => setStaffForm(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Role *</Text>
            <View style={styles.roleSelector}>
              {STAFF_ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleOption,
                    staffForm.role === role.id && styles.selectedRoleOption,
                    { borderColor: role.color }
                  ]}
                  onPress={() => setStaffForm(prev => ({ ...prev, role: role.id }))}
                >
                  <Text style={[
                    styles.roleOptionText,
                    staffForm.role === role.id && { color: role.color }
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Department</Text>
            <TextInput
              style={styles.formInput}
              value={staffForm.department}
              onChangeText={(text) => setStaffForm(prev => ({ ...prev, department: text }))}
              placeholder="e.g., Operations, Customer Success"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Office Location</Text>
            <TextInput
              style={styles.formInput}
              value={staffForm.location}
              onChangeText={(text) => setStaffForm(prev => ({ ...prev, location: text }))}
              placeholder="e.g., Mumbai Office, Delhi Office"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Permissions</Text>
            <Text style={styles.formSubLabel}>Select the permissions for this staff member</Text>
            <View style={styles.permissionsGrid}>
              {PERMISSIONS.map((permission) => (
                <TouchableOpacity
                  key={permission.id}
                  style={[
                    styles.permissionOption,
                    staffForm.permissions.includes(permission.id) && styles.selectedPermissionOption
                  ]}
                  onPress={() => togglePermission(permission.id)}
                >
                  <View style={styles.permissionHeader}>
                    <Text style={[
                      styles.permissionOptionText,
                      staffForm.permissions.includes(permission.id) && styles.selectedPermissionText
                    ]}>
                      {permission.label}
                    </Text>
                    {staffForm.permissions.includes(permission.id) && (
                      <Shield size={16} color="#FF6B35" />
                    )}
                  </View>
                  <Text style={styles.permissionDescription}>{permission.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveStaff}>
            <Text style={styles.saveButtonText}>
              {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff Management</Text>
        <View style={styles.headerActions}>
          {changeRequests.filter(r => r.status === 'pending').length > 0 && (
            <TouchableOpacity 
              style={styles.scheduleRequestsButton} 
              onPress={() => setShowScheduleRequestsModal(true)}
            >
              <Clock size={20} color="#FFFFFF" />
              <View style={styles.requestsBadge}>
                <Text style={styles.requestsBadgeText}>
                  {changeRequests.filter(r => r.status === 'pending').length}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['all', 'active', 'inactive'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({staff.filter(s => tab === 'all' || s.status === tab).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {getFilteredStaff().length > 0 ? (
          getFilteredStaff().map(renderStaffCard)
        ) : (
          <View style={styles.emptyState}>
            <Users size={60} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No staff members found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedTab === 'all' 
                ? 'Add your first staff member to get started'
                : `No ${selectedTab} staff members`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      <AddStaffModal />
      
      {/* Schedule Change Requests Modal */}
      <Modal visible={showScheduleRequestsModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Change Requests</Text>
            <TouchableOpacity onPress={() => setShowScheduleRequestsModal(false)}>
              <X size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {changeRequests.filter(r => r.status === 'pending').length > 0 ? (
              changeRequests.filter(r => r.status === 'pending').map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestChefName}>{request.chefName}</Text>
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.requestReason}>Reason: {request.reason}</Text>
                  <Text style={styles.requestDate}>
                    Requested: {request.requestedAt.toLocaleDateString()} at {request.requestedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>

                  <View style={styles.scheduleComparison}>
                    <Text style={styles.comparisonTitle}>Requested Changes:</Text>
                    {request.requestedSchedule.map((day, index) => (
                      <View key={day.day} style={styles.dayComparison}>
                        <Text style={styles.dayComparisonName}>
                          {day.day.charAt(0).toUpperCase() + day.day.slice(1)}:
                        </Text>
                        <Text style={styles.dayComparisonHours}>
                          {day.isWorking ? `${day.hours.start} - ${day.hours.end}` : 'Closed'}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.requestActions}>
                    <TouchableOpacity 
                      style={styles.rejectRequestButton}
                      onPress={() => {
                        Alert.prompt(
                          'Reject Request',
                          'Please provide a reason for rejection:',
                          (reason) => {
                            if (reason) {
                              handleRejectScheduleChange(request.id, reason);
                            }
                          }
                        );
                      }}
                    >
                      <X size={16} color="#FFFFFF" />
                      <Text style={styles.rejectRequestButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.approveRequestButton}
                      onPress={() => handleApproveScheduleChange(request.id, 'Approved for emergency schedule change')}
                    >
                      <CheckCircle size={16} color="#FFFFFF" />
                      <Text style={styles.approveRequestButtonText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noRequestsState}>
                <Clock size={48} color="#BDC3C7" />
                <Text style={styles.noRequestsText}>No pending requests</Text>
                <Text style={styles.noRequestsSubtext}>
                  Chef schedule change requests will appear here
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleRequestsButton: {
    backgroundColor: '#FF9800',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  requestsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestChefName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  urgentBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  requestReason: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  requestDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  scheduleComparison: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  dayComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayComparisonName: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
  },
  dayComparisonHours: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectRequestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  approveRequestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noRequestsState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noRequestsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
  },
  noRequestsSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
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
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  staffImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  department: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  staffActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  staffDetails: {
    gap: 12,
  },
  contactInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2C3E50',
  },
  staffMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#7F8C8D',
  },
  permissionsSection: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  permissionChip: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  statusSection: {
    alignItems: 'flex-start',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    marginTop: 20,
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
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formSubLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
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
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedRoleOption: {
    backgroundColor: '#FFF5F0',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  permissionsGrid: {
    gap: 12,
  },
  permissionOption: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedPermissionOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectedPermissionText: {
    color: '#FF6B35',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});