import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, X, Chrome as Home, User, ShoppingBag, Settings, ChefHat, Users, ChartBar as BarChart3, LogOut, CreditCard, Award, MessageCircle } from 'lucide-react-native';
import { MapPin, DollarSign } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'expo-router';
import { isFeatureEnabled } from '@/config/featureFlags';
import { Avatar } from '@/components/ui/Avatar';
import { getResponsiveDimensions } from '@/utils/responsive';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/utils/constants';
import { NotificationBell } from '@/components/ui/NotificationBell';

function CustomHeader() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user, userRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isWeb, isDesktop, sidebarWidth } = getResponsiveDimensions();

  const getMenuItems = () => {
    switch (userRole) {
      case 'customer':
        const customerItems = [
          { icon: Home, label: 'Home', route: '/(tabs)/home', key: 'home' },
          { icon: ShoppingBag, label: 'My Orders', route: '/(tabs)/orders', key: 'orders' },
          { icon: MapPin, label: 'My Addresses', route: '/(tabs)/addresses', key: 'addresses' },
          { icon: CreditCard, label: 'Payment Methods', route: '/(tabs)/payment', key: 'payment' },
          { icon: User, label: 'Profile', route: '/(tabs)/profile', key: 'profile' },
        ];
        
        // Add rewards if enabled
        if (isFeatureEnabled('ENABLE_REWARDS_SYSTEM')) {
          customerItems.splice(2, 0, { icon: Award, label: 'Rewards', route: '/(tabs)/rewards', key: 'rewards' });
        }
        
        // Add support for all users
        customerItems.push({ icon: MessageCircle, label: 'Support', route: '/(tabs)/support', key: 'support' });
        
        return customerItems;
      case 'chef':
        return [
          { icon: Home, label: 'Dashboard', route: '/(tabs)/chef-home', key: 'chef-home' },
          { icon: User, label: 'Chef Profile', route: '/(tabs)/chef-profile', key: 'chef-profile' },
          { icon: ChefHat, label: 'Menu Management', route: '/(tabs)/chef-menu-management', key: 'chef-menu-management' },
          { icon: ShoppingBag, label: 'My Orders', route: '/(tabs)/chef-orders', key: 'chef-orders' },
          { icon: DollarSign, label: 'Finances & P/L', route: '/(tabs)/chef-finances', key: 'chef-finances' },
          { icon: MessageCircle, label: 'Support', route: '/(tabs)/support', key: 'support' },
        ];
      case 'admin':
        return [
          { icon: BarChart3, label: 'Dashboard', route: '/(tabs)/dashboard', key: 'dashboard' },
          { icon: Users, label: 'Chef Management', route: '/(tabs)/chefs', key: 'chefs' },
          { icon: MapPin, label: 'Delivery Partners', route: '/(tabs)/admin-delivery-partners', key: 'admin-delivery-partners' },
          { icon: Users, label: 'Staff Management', route: '/(tabs)/admin-staff-management', key: 'admin-staff-management' },
          { icon: DollarSign, label: 'Payout Management', route: '/(tabs)/admin-payout-management', key: 'admin-payout-management' },
          { icon: BarChart3, label: 'Analytics', route: '/(tabs)/admin-analytics', key: 'admin-analytics' },
          { icon: MessageCircle, label: 'Customer Support', route: '/(tabs)/admin-customer-support', key: 'admin-customer-support' },
          { icon: ShoppingBag, label: 'All Orders', route: '/(tabs)/orders', key: 'orders' },
          { icon: BarChart3, label: 'Ad Management', route: '/(tabs)/admin-ad-management', key: 'admin-ad-management' },
          { icon: Settings, label: 'Settings', route: '/(tabs)/settings', key: 'settings' },
        ];
      case 'delivery_partner':
        return [
          { icon: BarChart3, label: 'Dashboard', route: '/(tabs)/delivery-dashboard', key: 'delivery-dashboard' },
          { icon: ShoppingBag, label: 'Available Orders', route: '/(tabs)/delivery-orders', key: 'delivery-orders' },
          { icon: MapPin, label: 'My Deliveries', route: '/(tabs)/delivery-history', key: 'delivery-history' },
          { icon: DollarSign, label: 'Earnings', route: '/(tabs)/delivery-earnings', key: 'delivery-earnings' },
          { icon: User, label: 'Profile', route: '/(tabs)/profile', key: 'profile' },
          { icon: MessageCircle, label: 'Support', route: '/(tabs)/support', key: 'support' },
        ];
      default:
        return [
          { icon: Home, label: 'Home', route: '/(tabs)/home', key: 'home' },
        ];
    }
  };

  const handleNavigation = (route: string) => {
    setSidebarVisible(false);
    router.push(route as any);
  };

  const handleLogout = () => {
    setSidebarVisible(false);
    logout();
  };

  const getPageTitle = () => {
    const menuItems = getMenuItems();
    const currentItem = menuItems.find(item => {
      // Handle exact matches and partial matches for nested routes
      if (pathname === item.route || pathname.includes(item.key)) {
        return true;
      }
      return false;
    });
    
    // Default titles based on user role if no specific match
    if (!currentItem) {
      switch (userRole) {
        case 'chef':
          return 'Chef Dashboard';
        case 'admin':
          return 'Admin Dashboard';
        case 'delivery_partner':
          return 'Delivery Dashboard';
        case 'customer':
        default:
          return 'HomeChef';
      }
    }
    
    return currentItem.label;
  };

  return (
    <>
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarVisible(!sidebarVisible)}
        >
          <Menu size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isWeb && styles.webHeaderTitle]}>{getPageTitle()}</Text>
        <View style={styles.headerRight}>
          <NotificationBell />
        </View>
      </View>

      <Modal
        visible={sidebarVisible}
        animationType={isWeb ? "fade" : "slide"}
        transparent={true}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={[styles.modalBackground, isWeb && styles.webModalBackground]}
            onPress={() => setSidebarVisible(false)}
          />
          <View style={[styles.sidebar, { width: sidebarWidth }, isWeb && styles.webSidebar]}>
            <SafeAreaView style={styles.sidebarContent}>
              {/* Header */}
              <View style={styles.sidebarHeader}>
                <View style={styles.profileSection}>
                  <Avatar 
                    source={{ uri: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg' }}
                    name={user?.name}
                    size="medium"
                    showBorder
                    borderColor={COLORS.border.light}
                  />
                  <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userRole}>{userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSidebarVisible(false)}
                >
                  <X size={24} color={COLORS.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <ScrollView style={styles.menuContainer}>
                {getMenuItems().map((item, index) => {
                  const isActive = pathname.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.menuItem, isActive && styles.activeMenuItem]}
                      onPress={() => handleNavigation(item.route)}
                    >
                      <item.icon 
                        size={22} 
                        color={isActive ? COLORS.text.primary : COLORS.text.secondary} 
                      />
                      <Text style={[
                        styles.menuItemText,
                        isActive && styles.activeMenuItemText
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Logout Button */}
              <View style={styles.sidebarFooter}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <LogOut size={22} color={COLORS.text.secondary} />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Stack
      screenOptions={{
        header: () => <CustomHeader />,
      }}
    >
      {/* Customer Routes */}
      <Stack.Screen name="home" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="rewards" />
      <Stack.Screen name="support" />
      
      {/* Chef Routes */}
      <Stack.Screen name="chef-home" />
      <Stack.Screen name="chef-profile" />
      <Stack.Screen name="chef-menu-management" />
      <Stack.Screen name="chef-orders" />
      <Stack.Screen name="chef-finances" />
      
      {/* Admin Routes */}
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="chefs" />
      <Stack.Screen name="admin-delivery-partners" />
      <Stack.Screen name="admin-staff-management" />
      <Stack.Screen name="admin-payout-management" />
      <Stack.Screen name="admin-analytics" />
      <Stack.Screen name="admin-customer-support" />
      <Stack.Screen name="admin-ad-management" />
      <Stack.Screen name="settings" />
      
      {/* Delivery Partner Routes */}
      <Stack.Screen name="delivery-dashboard" />
      <Stack.Screen name="delivery-orders" />
      <Stack.Screen name="delivery-history" />
      <Stack.Screen name="delivery-earnings" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  webHeader: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  webHeaderTitle: {
    fontSize: FONT_SIZES.xl,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  webIndicator: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: COLORS.background.overlay,
  },
  webModalBackground: {
    backgroundColor: COLORS.background.overlay,
  },
  sidebar: {
    backgroundColor: COLORS.background.primary,
  },
  webSidebar: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border.light,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarHeader: {
    backgroundColor: COLORS.background.primary,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    flex: 1,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  closeButton: {
    padding: SPACING.md,
  },
  menuContainer: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  activeMenuItem: {
    backgroundColor: COLORS.background.secondary,
  },
  menuItemText: {
    marginLeft: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeMenuItemText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingVertical: SPACING.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  logoutText: {
    marginLeft: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});