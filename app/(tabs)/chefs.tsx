import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X, Eye, MapPin, Star, FileText } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContactActions } from '@/components/ui/ContactActions';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';

const CHEF_APPLICATIONS = [
  {
    id: 1,
    name: 'Sunita Devi',
    location: 'Delhi, 110001',
    specialty: 'North Indian Cuisine',
    experience: '5 years',
    status: 'pending',
    rating: null,
    phone: '+91 98765 43210',
    email: 'sunita@example.com',
    documents: {
      identity: 'Aadhaar Card',
      foodSafety: 'FSSAI License',
      address: 'Utility Bill',
    },
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
  },
  {
    id: 2,
    name: 'Kavita Sharma',
    location: 'Mumbai, 400001',
    specialty: 'Maharashtrian & Punjabi',
    experience: '8 years',
    status: 'approved',
    rating: 4.8,
    phone: '+91 98765 43211',
    email: 'kavita@example.com',
    documents: {
      identity: 'PAN Card',
      foodSafety: 'FSSAI License',
      address: 'Rent Agreement',
    },
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
  },
  {
    id: 3,
    name: 'Lakshmi Reddy',
    location: 'Hyderabad, 500001',
    specialty: 'South Indian',
    experience: '3 years',
    status: 'rejected',
    rating: null,
    phone: '+91 98765 43212',
    email: 'lakshmi@example.com',
    documents: {
      identity: 'Voter ID',
      foodSafety: 'Pending',
      address: 'Utility Bill',
    },
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
  },
];

export default function AdminChefsManagement() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [chefs, setChefs] = useState(CHEF_APPLICATIONS);

  const updateChefStatus = (id: number, newStatus: 'approved' | 'rejected') => {
    setChefs(prevChefs => 
      prevChefs.map(chef => 
        chef.id === id ? { ...chef, status: newStatus } : chef
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF6B35';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#7F8C8D';
    }
  };

  const renderChefCard = (chef: typeof CHEF_APPLICATIONS[0]) => (
    <Card key={chef.id} style={styles.chefCard} variant="elevated">
      <View style={styles.chefHeader}>
        <Avatar 
          source={{ uri: chef.image }} 
          name={chef.name}
          size="large"
          showBorder
        />
        <View style={styles.chefInfo}>
          <Text style={styles.chefName}>{chef.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#666" />
            <Text style={styles.location}>{chef.location}</Text>
          </View>
          <Text style={styles.specialty}>{chef.specialty}</Text>
          <Text style={styles.experience}>Experience: {chef.experience}</Text>
          {chef.rating && (
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{chef.rating}</Text>
            </View>
          )}
        </View>
        <StatusIndicator status={chef.status} type="chef" />
      </View>

      <ContactActions
        phone={chef.phone}
        email={chef.email}
        variant="horizontal"
        size="small"
      />

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>Documents Submitted</Text>
        <View style={styles.documentsGrid}>
          <View style={styles.documentItem}>
            <FileText size={16} color="#4CAF50" />
            <Text style={styles.documentText}>Identity: {chef.documents.identity}</Text>
          </View>
          <View style={styles.documentItem}>
            <FileText size={16} color={chef.documents.foodSafety === 'Pending' ? '#F44336' : '#4CAF50'} />
            <Text style={styles.documentText}>Food Safety: {chef.documents.foodSafety}</Text>
          </View>
          <View style={styles.documentItem}>
            <FileText size={16} color="#4CAF50" />
            <Text style={styles.documentText}>Address: {chef.documents.address}</Text>
          </View>
        </View>
      </View>

      {chef.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            title="View Details"
            onPress={() => {/* View details */}}
            variant="outline"
            size="small"
            icon={<Eye size={16} color={COLORS.secondary} />}
          />
          <Button
            title="Approve"
            onPress={() => updateChefStatus(chef.id, 'approved')}
            variant="secondary"
            size="small"
            icon={<Check size={16} color={COLORS.text.white} />}
          />
          <Button
            title="Reject"
            onPress={() => updateChefStatus(chef.id, 'rejected')}
            variant="danger"
            size="small"
            icon={<X size={16} color={COLORS.text.white} />}
          />
        </View>
      )}
    </Card>
  );

  const filteredChefs = chefs.filter(chef => chef.status === selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chef Management</Text>
      </View>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'pending', label: 'Pending', count: chefs.filter(chef => chef.status === 'pending').length },
          { id: 'approved', label: 'Approved', count: chefs.filter(chef => chef.status === 'approved').length },
          { id: 'rejected', label: 'Rejected', count: chefs.filter(chef => chef.status === 'rejected').length },
        ]}
        selectedTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab as typeof selectedTab)}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredChefs.length > 0 ? (
          filteredChefs.map(renderChefCard)
        ) : (
          <EmptyState
            icon={ChefHat}
            title={`No ${selectedTab} applications`}
            subtitle={
              selectedTab === 'pending' ? 'New chef applications will appear here' :
              selectedTab === 'approved' ? 'Approved chefs will be listed here' :
              'Rejected applications will be shown here'
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  chefCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  chefHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  chefInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  chefName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  location: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  specialty: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  experience: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  documentsSection: {
    marginBottom: SPACING.lg,
  },
  documentsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  documentsGrid: {
    gap: SPACING.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  documentText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});