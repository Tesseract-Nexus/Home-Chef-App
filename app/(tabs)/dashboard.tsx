import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Users, ShoppingBag, DollarSign, ChefHat, Truck, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, X, Eye, Settings, Download, Calendar } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { PLATFORM_CONFIG } from '@/config/featureFlags';

const PENDING_APPROVALS = [
  { type: 'chef', name: 'Sunita Devi', location: 'Delhi', count: 5 },
  { type: 'delivery', name: 'Rajesh Kumar', location: 'Mumbai', count: 4 },
  { type: 'payout', name: 'Weekly Payouts', location: 'All Regions', count: 3 },
];

const RECENT_ACTIVITIES = [
  { type: 'chef_approved', message: 'Chef Priya Sharma approved', time: '2 mins ago', status: 'success' },
  { type: 'order_completed', message: 'Order #ORD125 completed', time: '5 mins ago', status: 'info' },
  { type: 'delivery_onboarded', message: 'Delivery partner Amit joined', time: '10 mins ago', status: 'success' },
  { type: 'payment_processed', message: 'Weekly payout processed', time: '1 hour ago', status: 'info' },
  { type: 'issue_reported', message: 'Customer complaint reported', time: '2 hours ago', status: 'warning' },
];

const PLATFORM_REVENUE = {
  today: {
    totalOrders: 234,
    grossOrderValue: 156800,
    platformFees: 23520, // 15% of gross order value
    deliveryFees: 5850,
    paymentProcessingFees: 3920,
    totalRevenue: 33290,
    chefEarnings: 133280,
    deliveryEarnings: 11700,
  },
  thisWeek: {
    totalOrders: 1567,
    grossOrderValue: 1089600,
    platformFees: 163440,
    deliveryFees: 39175,
    paymentProcessingFees: 27240,
    totalRevenue: 229855,
    chefEarnings: 926160,
    deliveryEarnings: 78340,
  },
  thisMonth: {
    totalOrders: 6789,
    grossOrderValue: 4567800,
    platformFees: 685170,
    deliveryFees: 169725,
    paymentProcessingFees: 114195,
    totalRevenue: 969090,
    chefEarnings: 3882630,
    deliveryEarnings: 339450,
  },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'thisWeek' | 'thisMonth'>('today');
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const currentRevenue = PLATFORM_REVENUE[selectedPeriod];

  const renderStatCard = (stat: typeof DASHBOARD_STATS[0], index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
        <stat.icon size={24} color={stat.color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
        <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#4CAF50' : '#F44336' }]}>
          {stat.change}
        </Text>
      </View>
    </View>
  );

  const renderApprovalCard = (approval: typeof PENDING_APPROVALS[0], index: number) => (
    <TouchableOpacity key={index} style={styles.approvalCard}>
      <View style={styles.approvalIcon}>
        {approval.type === 'chef' && <ChefHat size={20} color="#FF6B35" />}
        {approval.type === 'delivery' && <Truck size={20} color="#2196F3" />}
        {approval.type === 'payout' && <DollarSign size={20} color="#4CAF50" />}
      </View>
      <View style={styles.approvalInfo}>
        <Text style={styles.approvalName}>{approval.name}</Text>
        <Text style={styles.approvalLocation}>{approval.location}</Text>
      </View>
      <View style={styles.approvalBadge}>
        <Text style={styles.approvalCount}>{approval.count}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActivityItem = (activity: typeof RECENT_ACTIVITIES[0], index: number) => (
    <View key={index} style={styles.activityItem}>
      <View style={[styles.activityDot, { backgroundColor: getActivityColor(activity.status) }]} />
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#2196F3';
    }
  };

  const RevenueModal = () => (
    <Modal visible={showRevenueModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Detailed Revenue Report</Text>
          <TouchableOpacity onPress={() => setShowRevenueModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.revenueBreakdown}>
            <Text style={styles.breakdownTitle}>Revenue Breakdown - {selectedPeriod}</Text>
            
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownSectionTitle}>Platform Revenue</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Commission Fees (15%)</Text>
                <Text style={styles.breakdownValue}>₹{currentRevenue.platformFees.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery Fees</Text>
                <Text style={styles.breakdownValue}>₹{currentRevenue.deliveryFees.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Payment Processing</Text>
                <Text style={styles.breakdownValue}>₹{currentRevenue.paymentProcessingFees.toLocaleString()}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.breakdownTotalLabel}>Total Platform Revenue</Text>
                <Text style={styles.breakdownTotalValue}>₹{currentRevenue.totalRevenue.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownSectionTitle}>Partner Earnings</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Chef Earnings (85%)</Text>
                <Text style={styles.breakdownValue}>₹{currentRevenue.chefEarnings.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery Partner Earnings</Text>
                <Text style={styles.breakdownValue}>₹{currentRevenue.deliveryEarnings.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownSectionTitle}>Order Statistics</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Orders</Text>
                <Text style={styles.breakdownValue}>{currentRevenue.totalOrders}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Gross Order Value</Text>
                <Text style={styles.breakdownValue}>₹{currentRevenue.grossOrderValue.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Average Order Value</Text>
                <Text style={styles.breakdownValue}>₹{Math.round(currentRevenue.grossOrderValue / currentRevenue.totalOrders)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>HomeChef Admin Portal</Text>
            <Text style={styles.dateText}>Platform Overview • {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.statsSection}>
          <SectionHeader title="Platform Overview" />
          <View style={styles.statsGrid}>
            <MetricCard
              title="Today's Revenue"
              value="₹45,680"
              icon={DollarSign}
              color={COLORS.success}
              change="+12%"
              size="small"
            />
            <MetricCard
              title="Total Orders"
              value="234"
              icon={ShoppingBag}
              color={COLORS.info}
              change="+8%"
              size="small"
            />
            <MetricCard
              title="Active Chefs"
              value="89"
              icon={ChefHat}
              color={COLORS.primary}
              change="+15%"
              size="small"
            />
            <MetricCard
              title="Delivery Partners"
              value="156"
              icon={Truck}
              color={COLORS.secondary}
              change="+5%"
              size="small"
            />
            <MetricCard
              title="Active Customers"
              value="2,456"
              icon={Users}
              color={COLORS.info}
              change="+18%"
              size="small"
            />
            <MetricCard
              title="Pending Approvals"
              value="12"
              icon={AlertTriangle}
              color={COLORS.warning}
              change="+3"
              size="small"
            />
          </View>
        </View>

        {/* Revenue Section */}
        <View style={styles.revenueSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Platform Revenue</Text>
            <TouchableOpacity onPress={() => setShowRevenueModal(true)}>
              <Eye size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {[
              { key: 'today', label: 'Today' },
              { key: 'thisWeek', label: 'This Week' },
              { key: 'thisMonth', label: 'This Month' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.activePeriodButton
                ]}
                onPress={() => setSelectedPeriod(period.key as typeof selectedPeriod)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.activePeriodButtonText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Revenue Cards */}
          <View style={styles.revenueGrid}>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueValue}>₹{currentRevenue.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.revenueLabel}>Total Platform Revenue</Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueValue}>₹{currentRevenue.platformFees.toLocaleString()}</Text>
              <Text style={styles.revenueLabel}>Commission Fees (15%)</Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueValue}>₹{currentRevenue.deliveryFees.toLocaleString()}</Text>
              <Text style={styles.revenueLabel}>Delivery Fees</Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueValue}>{currentRevenue.totalOrders}</Text>
              <Text style={styles.revenueLabel}>Total Orders</Text>
            </View>
          </View>
        </View>

        {/* Pending Approvals */}
        <View style={styles.approvalsSection}>
          <SectionHeader
            title="Pending Approvals"
            actionText="View All"
            onActionPress={() => {}}
            showChevron
          />
          {PENDING_APPROVALS.map(renderApprovalCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <ChefHat size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Manage Chefs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Truck size={24} color="#2196F3" />
              <Text style={styles.actionText}>Delivery Partners</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <DollarSign size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Payout Management</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={24} color="#9C27B0" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Users size={24} color="#00BCD4" />
              <Text style={styles.actionText}>Customer Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Settings size={24} color="#607D8B" />
              <Text style={styles.actionText}>Platform Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <SectionHeader title="Recent Activities" />
          <View style={styles.activitiesContainer}>
            {RECENT_ACTIVITIES.map(renderActivityItem)}
          </View>
        </View>

        {/* System Health */}
        <View style={styles.systemHealth}>
          <SectionHeader title="System Health" />
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <View style={styles.healthStatus}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.healthLabel}>API Status</Text>
              </View>
              <Text style={styles.healthValue}>Operational</Text>
            </View>
            <View style={styles.healthCard}>
              <View style={styles.healthStatus}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.healthLabel}>Payment Gateway</Text>
              </View>
              <Text style={styles.healthValue}>Healthy</Text>
            </View>
            <View style={styles.healthCard}>
              <View style={styles.healthStatus}>
                <Clock size={16} color="#FF9800" />
                <Text style={styles.healthLabel}>Database</Text>
              </View>
              <Text style={styles.healthValue}>99.9% Uptime</Text>
            </View>
            <View style={styles.healthCard}>
              <View style={styles.healthStatus}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.healthLabel}>SMS Service</Text>
              </View>
              <Text style={styles.healthValue}>Active</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <RevenueModal />
    </View>
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
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  dateText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  settingsButton: {
    backgroundColor: '#FF6B35',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revenueSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#FF6B35',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  revenueCard: {
    backgroundColor: '#F8F9FA',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  revenueLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  approvalsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  approvalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  approvalLocation: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  approvalBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvalCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  activitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activitiesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  systemHealth: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
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
  revenueBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  breakdownSection: {
    marginBottom: 20,
  },
  breakdownSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
});