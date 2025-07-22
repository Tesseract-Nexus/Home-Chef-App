import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Shield, CreditCard, MapPin, Users, ChartBar as BarChart3, FileText, CircleHelp as HelpCircle, Settings as SettingsIcon, Save } from 'lucide-react-native';
import { PLATFORM_CONFIG } from '@/config/featureFlags';

const SETTINGS_SECTIONS = [
  {
    title: 'App Management',
    items: [
      { icon: Users, label: 'User Management', subtitle: 'Manage customers and chefs' },
      { icon: MapPin, label: 'Location Settings', subtitle: 'Manage serviceable areas' },
      { icon: CreditCard, label: 'Payment Settings', subtitle: 'Configure payment methods' },
      { icon: BarChart3, label: 'Analytics & Reports', subtitle: 'View app performance' },
    ]
  },
  {
    title: 'Content & Policy',
    items: [
      { icon: FileText, label: 'Terms & Conditions', subtitle: 'Update app policies' },
      { icon: Shield, label: 'Privacy Policy', subtitle: 'Manage data privacy' },
      { icon: Bell, label: 'Notification Settings', subtitle: 'Configure app notifications' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', subtitle: 'Manage support tickets' },
    ]
  }
];

const NOTIFICATION_SETTINGS = [
  { key: 'newOrders', label: 'New Order Notifications', enabled: true },
  { key: 'chefApplications', label: 'Chef Application Alerts', enabled: true },
  { key: 'paymentAlerts', label: 'Payment Notifications', enabled: false },
  { key: 'systemUpdates', label: 'System Update Notifications', enabled: true },
];

export default function AdminSettings() {
  const [cancellationSettings, setCancellationSettings] = React.useState({
    freeWindowSeconds: PLATFORM_CONFIG.FREE_CANCELLATION_WINDOW_SECONDS,
    penaltyRate: PLATFORM_CONFIG.CANCELLATION_PENALTY_RATE * 100, // Convert to percentage
    minPenalty: PLATFORM_CONFIG.MIN_CANCELLATION_PENALTY,
    maxPenalty: PLATFORM_CONFIG.MAX_CANCELLATION_PENALTY,
  });
  const [notifications, setNotifications] = React.useState(NOTIFICATION_SETTINGS);

  const toggleNotification = (key: string) => {
    setNotifications(prev => 
      prev.map(item => 
        item.key === key ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const saveCancellationSettings = () => {
    // In a real app, this would make an API call to update the settings
    Alert.alert(
      'Settings Updated',
      'Order cancellation policy has been updated successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleCancellationSettingChange = (field: string, value: string) => {
    setCancellationSettings(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const renderSettingsSection = (section: typeof SETTINGS_SECTIONS[0]) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.settingsItem}>
          <View style={styles.itemLeft}>
            <View style={styles.iconContainer}>
              <item.icon size={20} color="#FF6B35" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNotificationItem = (item: typeof NOTIFICATION_SETTINGS[0]) => (
    <View key={item.key} style={styles.notificationItem}>
      <Text style={styles.notificationLabel}>{item.label}</Text>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleNotification(item.key)}
        trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
        thumbColor={item.enabled ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* App Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>App Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1,234</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Active Chefs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5,678</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₹2.4L</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
        </View>

        {/* Order Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Cancellation Policy</Text>
          
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <SettingsIcon size={20} color="#FF6B35" />
              <Text style={styles.policyTitle}>Cancellation Settings</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Free Cancellation Window (seconds)</Text>
              <TextInput
                style={styles.settingInput}
                value={cancellationSettings.freeWindowSeconds.toString()}
                onChangeText={(value) => handleCancellationSettingChange('freeWindowSeconds', value)}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Penalty Rate (%)</Text>
              <TextInput
                style={styles.settingInput}
                value={cancellationSettings.penaltyRate.toString()}
                onChangeText={(value) => handleCancellationSettingChange('penaltyRate', value)}
                keyboardType="numeric"
                placeholder="40"
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Minimum Penalty (₹)</Text>
              <TextInput
                style={styles.settingInput}
                value={cancellationSettings.minPenalty.toString()}
                onChangeText={(value) => handleCancellationSettingChange('minPenalty', value)}
                keyboardType="numeric"
                placeholder="20"
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Maximum Penalty (₹)</Text>
              <TextInput
                style={styles.settingInput}
                value={cancellationSettings.maxPenalty.toString()}
                onChangeText={(value) => handleCancellationSettingChange('maxPenalty', value)}
                keyboardType="numeric"
                placeholder="500"
              />
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={saveCancellationSettings}>
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.quickSettings}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          {notifications.map(renderNotificationItem)}
        </View>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map(renderSettingsSection)}

        {/* App Information */}
        <View style={styles.appInfo}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.01</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Environment</Text>
              <Text style={styles.infoValue}>Production</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>Jan 15, 2024</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  quickSettings: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLabel: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF5F0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  appInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  infoGrid: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  policyCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  settingInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2C3E50',
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});