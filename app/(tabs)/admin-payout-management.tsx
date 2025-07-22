import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, Calendar, Clock, CircleCheck as CheckCircle, X, TriangleAlert as AlertTriangle, Download, Filter, Send, Eye, CreditCard, Building2 } from 'lucide-react-native';

interface PayoutSchedule {
  id: string;
  type: 'chef' | 'delivery';
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  minimumAmount: number;
  processingFee: number;
  isActive: boolean;
}

interface PendingPayout {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'chef' | 'delivery';
  amount: number;
  period: string;
  dueDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  breakdown: {
    grossEarnings: number;
    platformFee: number;
    processingFee: number;
    netAmount: number;
  };
}

const PAYOUT_SCHEDULES: PayoutSchedule[] = [
  {
    id: '1',
    type: 'chef',
    frequency: 'weekly',
    dayOfWeek: 5, // Friday
    minimumAmount: 500,
    processingFee: 10,
    isActive: true,
  },
  {
    id: '2',
    type: 'delivery',
    frequency: 'weekly',
    dayOfWeek: 5, // Friday
    minimumAmount: 200,
    processingFee: 5,
    isActive: true,
  },
];

const PENDING_PAYOUTS: PendingPayout[] = [
  {
    id: '1',
    recipientId: 'chef_1',
    recipientName: 'Priya Sharma',
    recipientType: 'chef',
    amount: 12450,
    period: 'Week 1-7 Jan 2024',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    bankDetails: {
      accountNumber: '****1234',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Priya Sharma',
      bankName: 'State Bank of India',
    },
    breakdown: {
      grossEarnings: 14650,
      platformFee: 2190,
      processingFee: 10,
      netAmount: 12450,
    },
  },
  {
    id: '2',
    recipientId: 'delivery_1',
    recipientName: 'Rajesh Kumar',
    recipientType: 'delivery',
    amount: 3240,
    period: 'Week 1-7 Jan 2024',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    bankDetails: {
      accountNumber: '****5678',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Rajesh Kumar',
      bankName: 'HDFC Bank',
    },
    breakdown: {
      grossEarnings: 3600,
      platformFee: 360,
      processingFee: 5,
      netAmount: 3240,
    },
  },
  {
    id: '3',
    recipientId: 'chef_2',
    recipientName: 'Meera Patel',
    recipientType: 'chef',
    amount: 8920,
    period: 'Week 1-7 Jan 2024',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'processing',
    bankDetails: {
      accountNumber: '****9012',
      ifscCode: 'ICIC0001234',
      accountHolderName: 'Meera Patel',
      bankName: 'ICICI Bank',
    },
    breakdown: {
      grossEarnings: 10500,
      platformFee: 1575,
      processingFee: 10,
      netAmount: 8920,
    },
  },
];

export default function AdminPayoutManagement() {
  const [payouts, setPayouts] = useState(PENDING_PAYOUTS);
  const [schedules, setSchedules] = useState(PAYOUT_SCHEDULES);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      default: return '#7F8C8D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Send;
      case 'completed': return CheckCircle;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const handleProcessPayout = (payoutId: string) => {
    Alert.alert(
      'Process Payout',
      'Are you sure you want to process this payout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Process', 
          onPress: () => {
            setPayouts(prev => prev.map(p => 
              p.id === payoutId ? { ...p, status: 'processing' } : p
            ));
            Alert.alert('Payout Initiated', 'The payout has been sent for processing.');
          }
        }
      ]
    );
  };

  const handleBulkProcess = () => {
    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    if (pendingPayouts.length === 0) {
      Alert.alert('No Pending Payouts', 'There are no pending payouts to process.');
      return;
    }

    Alert.alert(
      'Bulk Process Payouts',
      `Process ${pendingPayouts.length} pending payouts totaling ₹${pendingPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Process All', 
          onPress: () => {
            setBulkProcessing(true);
            setTimeout(() => {
              setPayouts(prev => prev.map(p => 
                p.status === 'pending' ? { ...p, status: 'processing' } : p
              ));
              setBulkProcessing(false);
              Alert.alert('Bulk Processing Complete', 'All pending payouts have been processed.');
            }, 2000);
          }
        }
      ]
    );
  };

  const renderPayoutCard = (payout: PendingPayout) => {
    const StatusIcon = getStatusIcon(payout.status);
    
    return (
      <View key={payout.id} style={styles.payoutCard}>
        <View style={styles.payoutHeader}>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{payout.recipientName}</Text>
            <View style={styles.recipientMeta}>
              <View style={[styles.typeBadge, { backgroundColor: payout.recipientType === 'chef' ? '#FF6B35' : '#2196F3' }]}>
                <Text style={styles.typeText}>{payout.recipientType.toUpperCase()}</Text>
              </View>
              <Text style={styles.period}>{payout.period}</Text>
            </View>
          </View>
          <View style={styles.payoutAmount}>
            <Text style={styles.amount}>₹{payout.amount.toLocaleString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payout.status) }]}>
              <StatusIcon size={12} color="#FFFFFF" />
              <Text style={styles.statusText}>{payout.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bankInfo}>
          <Building2 size={16} color="#666" />
          <View style={styles.bankDetails}>
            <Text style={styles.bankName}>{payout.bankDetails.bankName}</Text>
            <Text style={styles.accountInfo}>
              {payout.bankDetails.accountHolderName} • {payout.bankDetails.accountNumber}
            </Text>
            <Text style={styles.ifscCode}>IFSC: {payout.bankDetails.ifscCode}</Text>
          </View>
        </View>

        <View style={styles.payoutBreakdown}>
          <Text style={styles.breakdownTitle}>Payout Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Gross Earnings</Text>
            <Text style={styles.breakdownValue}>₹{payout.breakdown.grossEarnings.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Platform Fee</Text>
            <Text style={[styles.breakdownValue, { color: '#F44336' }]}>-₹{payout.breakdown.platformFee.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Processing Fee</Text>
            <Text style={[styles.breakdownValue, { color: '#F44336' }]}>-₹{payout.breakdown.processingFee}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.breakdownTotalLabel}>Net Payout</Text>
            <Text style={styles.breakdownTotalValue}>₹{payout.breakdown.netAmount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.payoutActions}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => {
              setSelectedPayout(payout);
              setShowPayoutModal(true);
            }}
          >
            <Eye size={16} color="#2196F3" />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          
          {payout.status === 'pending' && (
            <TouchableOpacity 
              style={styles.processButton}
              onPress={() => handleProcessPayout(payout.id)}
            >
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.processButtonText}>Process</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={16} color="#4CAF50" />
            <Text style={styles.downloadButtonText}>Receipt</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dueDateInfo}>
          <Calendar size={14} color={payout.dueDate < new Date() ? '#F44336' : '#FF9800'} />
          <Text style={[
            styles.dueDateText,
            { color: payout.dueDate < new Date() ? '#F44336' : '#FF9800' }
          ]}>
            Due: {payout.dueDate.toLocaleDateString()}
            {payout.dueDate < new Date() && ' (Overdue)'}
          </Text>
        </View>
      </View>
    );
  };

  const renderScheduleCard = (schedule: PayoutSchedule) => (
    <View key={schedule.id} style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleType}>
            {schedule.type === 'chef' ? 'Chef Payouts' : 'Delivery Partner Payouts'}
          </Text>
          <Text style={styles.scheduleFrequency}>
            {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} • 
            {schedule.frequency === 'weekly' && ` Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek!]}`}
            {schedule.frequency === 'monthly' && ` ${schedule.dayOfMonth}th of every month`}
          </Text>
        </View>
        <View style={[styles.scheduleStatus, { backgroundColor: schedule.isActive ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.scheduleStatusText}>{schedule.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      <View style={styles.scheduleDetails}>
        <View style={styles.scheduleRow}>
          <Text style={styles.scheduleLabel}>Minimum Amount</Text>
          <Text style={styles.scheduleValue}>₹{schedule.minimumAmount}</Text>
        </View>
        <View style={styles.scheduleRow}>
          <Text style={styles.scheduleLabel}>Processing Fee</Text>
          <Text style={styles.scheduleValue}>₹{schedule.processingFee}</Text>
        </View>
      </View>
    </View>
  );

  const PayoutDetailsModal = () => (
    <Modal visible={showPayoutModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Payout Details</Text>
          <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        {selectedPayout && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Recipient Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedPayout.recipientName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedPayout.recipientType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Period:</Text>
                <Text style={styles.detailValue}>{selectedPayout.period}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>{selectedPayout.dueDate.toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Bank Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Holder:</Text>
                <Text style={styles.detailValue}>{selectedPayout.bankDetails.accountHolderName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Number:</Text>
                <Text style={styles.detailValue}>{selectedPayout.bankDetails.accountNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IFSC Code:</Text>
                <Text style={styles.detailValue}>{selectedPayout.bankDetails.ifscCode}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bank Name:</Text>
                <Text style={styles.detailValue}>{selectedPayout.bankDetails.bankName}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Financial Breakdown</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gross Earnings:</Text>
                <Text style={styles.detailValue}>₹{selectedPayout.breakdown.grossEarnings.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Platform Fee:</Text>
                <Text style={[styles.detailValue, { color: '#F44336' }]}>-₹{selectedPayout.breakdown.platformFee.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Processing Fee:</Text>
                <Text style={[styles.detailValue, { color: '#F44336' }]}>-₹{selectedPayout.breakdown.processingFee}</Text>
              </View>
              <View style={[styles.detailRow, styles.totalDetailRow]}>
                <Text style={styles.detailTotalLabel}>Net Payout:</Text>
                <Text style={styles.detailTotalValue}>₹{selectedPayout.breakdown.netAmount.toLocaleString()}</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const ScheduleModal = () => (
    <Modal visible={showScheduleModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Payout Schedules</Text>
          <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.scheduleDescription}>
            Configure automatic payout schedules for chefs and delivery partners
          </Text>
          {schedules.map(renderScheduleCard)}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const filteredPayouts = payouts.filter(p => p.status === selectedTab);
  const totalPendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payout Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowScheduleModal(true)}
          >
            <Calendar size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleBulkProcess}
            disabled={bulkProcessing}
          >
            <Send size={20} color={bulkProcessing ? "#BDC3C7" : "#4CAF50"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₹{totalPendingAmount.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Pending Payouts</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{payouts.filter(p => p.status === 'pending').length}</Text>
          <Text style={styles.summaryLabel}>Recipients</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{payouts.filter(p => p.dueDate < new Date()).length}</Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['pending', 'processing', 'completed', 'failed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({payouts.filter(p => p.status === tab).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredPayouts.length > 0 ? (
          filteredPayouts.map(renderPayoutCard)
        ) : (
          <View style={styles.emptyState}>
            <DollarSign size={60} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No {selectedTab} payouts</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedTab === 'pending' && 'Pending payouts will appear here'}
              {selectedTab === 'processing' && 'Processing payouts will be shown here'}
              {selectedTab === 'completed' && 'Completed payouts will be listed here'}
              {selectedTab === 'failed' && 'Failed payouts will appear here'}
            </Text>
          </View>
        )}
      </ScrollView>

      <PayoutDetailsModal />
      <ScheduleModal />
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
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
    fontSize: 12,
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
  payoutCard: {
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
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  recipientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  period: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  payoutAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bankDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  accountInfo: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  ifscCode: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  payoutBreakdown: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2C3E50',
  },
  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  breakdownTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  payoutActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  processButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  downloadButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  scheduleFrequency: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  scheduleDetails: {
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
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
    paddingVertical: 6,
  },
  totalDetailRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  detailTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  detailTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});