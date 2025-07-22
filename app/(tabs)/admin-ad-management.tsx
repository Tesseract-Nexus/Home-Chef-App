import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Eye, EyeOff, CreditCard as Edit, Trash2, TrendingUp, DollarSign, Target, Calendar, ChartBar as BarChart3, Play, Pause } from 'lucide-react-native';
import { AdConfig } from '@/hooks/useAds';

const SAMPLE_AD_CAMPAIGNS: AdConfig[] = [
  {
    id: 'campaign_1',
    type: 'banner',
    title: 'Weekend Special Offer!',
    description: 'Get 30% off on orders above ₹500 this weekend',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    actionText: 'Order Now',
    sponsor: 'HomeChef Platform',
    category: 'food',
    priority: 'high',
    targeting: {
      userTypes: ['customer'],
      locations: ['Mumbai', 'Delhi', 'Bangalore'],
      interests: ['food', 'discounts'],
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      timeSlots: ['18:00-22:00', '12:00-14:00'],
    },
    budget: {
      totalBudget: 50000,
      costPerClick: 5,
      costPerView: 0.5,
    },
    performance: {
      impressions: 12450,
      clicks: 234,
      conversions: 45,
      revenue: 1170,
    },
  },
  {
    id: 'campaign_2',
    type: 'video',
    title: 'Become a HomeChef Partner',
    description: 'Join thousands of successful home chefs earning ₹30,000+ monthly',
    imageUrl: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    videoUrl: 'https://example.com/chef-recruitment.mp4',
    actionText: 'Join Now',
    sponsor: 'HomeChef Recruitment',
    category: 'lifestyle',
    priority: 'high',
    targeting: {
      userTypes: ['customer'],
      interests: ['cooking', 'entrepreneurship'],
    },
    schedule: {
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    budget: {
      totalBudget: 100000,
      costPerClick: 10,
      costPerView: 2,
    },
    performance: {
      impressions: 8900,
      clicks: 178,
      conversions: 52,
      revenue: 1780,
    },
  },
];

const AD_TYPES = [
  { id: 'banner', label: 'Banner Ad', description: 'Small banner ads in app' },
  { id: 'interstitial', label: 'Interstitial', description: 'Full-screen ads between actions' },
  { id: 'native', label: 'Native Ad', description: 'Ads that blend with content' },
  { id: 'video', label: 'Video Ad', description: 'Video advertisements' },
  { id: 'sponsored_content', label: 'Sponsored Content', description: 'Promoted content in feeds' },
];

const CATEGORIES = [
  { id: 'food', label: 'Food & Restaurant', emoji: '🍽️' },
  { id: 'delivery', label: 'Delivery Services', emoji: '🚚' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { id: 'tech', label: 'Technology', emoji: '📱' },
  { id: 'finance', label: 'Finance', emoji: '💳' },
];

const USER_TYPES = [
  { id: 'customer', label: 'Customers' },
  { id: 'chef', label: 'Chefs' },
  { id: 'delivery', label: 'Delivery Partners' },
];

export default function AdminAdManagement() {
  const [campaigns, setCampaigns] = useState<AdConfig[]>(SAMPLE_AD_CAMPAIGNS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdConfig | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'paused' | 'completed'>('active');
  
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    type: 'banner' as AdConfig['type'],
    category: 'food' as AdConfig['category'],
    priority: 'medium' as AdConfig['priority'],
    actionText: '',
    sponsor: '',
    imageUrl: '',
    videoUrl: '',
    targetUserTypes: ['customer'] as string[],
    targetLocations: [] as string[],
    targetInterests: [] as string[],
    totalBudget: '',
    costPerClick: '',
    costPerView: '',
    startDate: '',
    endDate: '',
    timeSlots: [] as string[],
  });

  const resetForm = () => {
    setCampaignForm({
      title: '',
      description: '',
      type: 'banner',
      category: 'food',
      priority: 'medium',
      actionText: '',
      sponsor: '',
      imageUrl: '',
      videoUrl: '',
      targetUserTypes: ['customer'],
      targetLocations: [],
      targetInterests: [],
      totalBudget: '',
      costPerClick: '',
      costPerView: '',
      startDate: '',
      endDate: '',
      timeSlots: [],
    });
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign: AdConfig) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      category: campaign.category,
      priority: campaign.priority,
      actionText: campaign.actionText,
      sponsor: campaign.sponsor,
      imageUrl: campaign.imageUrl,
      videoUrl: campaign.videoUrl || '',
      targetUserTypes: campaign.targeting.userTypes,
      targetLocations: campaign.targeting.locations || [],
      targetInterests: campaign.targeting.interests || [],
      totalBudget: campaign.budget.totalBudget.toString(),
      costPerClick: campaign.budget.costPerClick.toString(),
      costPerView: campaign.budget.costPerView.toString(),
      startDate: campaign.schedule.startDate.toISOString().split('T')[0],
      endDate: campaign.schedule.endDate.toISOString().split('T')[0],
      timeSlots: campaign.schedule.timeSlots || [],
    });
    setShowCreateModal(true);
  };

  const handleSaveCampaign = () => {
    if (!campaignForm.title || !campaignForm.description || !campaignForm.sponsor) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const campaignData: AdConfig = {
      id: editingCampaign?.id || `campaign_${Date.now()}`,
      title: campaignForm.title,
      description: campaignForm.description,
      type: campaignForm.type,
      category: campaignForm.category,
      priority: campaignForm.priority,
      actionText: campaignForm.actionText,
      sponsor: campaignForm.sponsor,
      imageUrl: campaignForm.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      videoUrl: campaignForm.videoUrl,
      targeting: {
        userTypes: campaignForm.targetUserTypes as any,
        locations: campaignForm.targetLocations,
        interests: campaignForm.targetInterests,
      },
      schedule: {
        startDate: new Date(campaignForm.startDate),
        endDate: new Date(campaignForm.endDate),
        timeSlots: campaignForm.timeSlots,
      },
      budget: {
        totalBudget: parseFloat(campaignForm.totalBudget),
        costPerClick: parseFloat(campaignForm.costPerClick),
        costPerView: parseFloat(campaignForm.costPerView),
      },
      performance: editingCampaign?.performance || {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
    };

    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? campaignData : c));
    } else {
      setCampaigns(prev => [...prev, campaignData]);
    }

    setShowCreateModal(false);
    resetForm();
    setEditingCampaign(null);
    Alert.alert('Success', `Campaign ${editingCampaign ? 'updated' : 'created'} successfully!`);
  };

  const handleDeleteCampaign = (id: string) => {
    Alert.alert(
      'Delete Campaign',
      'Are you sure you want to delete this ad campaign?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setCampaigns(prev => prev.filter(c => c.id !== id))
        }
      ]
    );
  };

  const toggleUserType = (userType: string) => {
    setCampaignForm(prev => ({
      ...prev,
      targetUserTypes: prev.targetUserTypes.includes(userType)
        ? prev.targetUserTypes.filter(t => t !== userType)
        : [...prev.targetUserTypes, userType]
    }));
  };

  const getCampaignStatus = (campaign: AdConfig) => {
    const now = new Date();
    if (now < campaign.schedule.startDate) return 'scheduled';
    if (now > campaign.schedule.endDate) return 'completed';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'scheduled': return '#2196F3';
      case 'completed': return '#7F8C8D';
      case 'paused': return '#FF9800';
      default: return '#7F8C8D';
    }
  };

  const calculateCTR = (campaign: AdConfig) => {
    return campaign.performance.impressions > 0 
      ? ((campaign.performance.clicks / campaign.performance.impressions) * 100).toFixed(2)
      : '0.00';
  };

  const calculateROI = (campaign: AdConfig) => {
    const spent = campaign.performance.clicks * campaign.budget.costPerClick + 
                  campaign.performance.impressions * campaign.budget.costPerView;
    return spent > 0 ? (((campaign.performance.revenue - spent) / spent) * 100).toFixed(1) : '0.0';
  };

  const renderCampaignCard = (campaign: AdConfig) => {
    const status = getCampaignStatus(campaign);
    const ctr = calculateCTR(campaign);
    const roi = calculateROI(campaign);

    return (
      <View key={campaign.id} style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            <View style={styles.campaignMeta}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(campaign.type) }]}>
                <Text style={styles.typeText}>{campaign.type.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                <Text style={styles.statusText}>{status.toUpperCase()}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(campaign.priority) }]}>
                <Text style={styles.priorityText}>{campaign.priority.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.campaignActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditCampaign(campaign)}
            >
              <Edit size={16} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteCampaign(campaign.id)}
            >
              <Trash2 size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.campaignDescription} numberOfLines={2}>
          {campaign.description}
        </Text>

        <View style={styles.campaignImage}>
          <Image source={{ uri: campaign.imageUrl }} style={styles.previewImage} />
          {campaign.type === 'video' && (
            <View style={styles.videoIndicator}>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.performanceSection}>
          <Text style={styles.performanceTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{campaign.performance.impressions.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Impressions</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{campaign.performance.clicks}</Text>
              <Text style={styles.metricLabel}>Clicks</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{ctr}%</Text>
              <Text style={styles.metricLabel}>CTR</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: parseFloat(roi) >= 0 ? '#4CAF50' : '#F44336' }]}>
                {roi}%
              </Text>
              <Text style={styles.metricLabel}>ROI</Text>
            </View>
          </View>
        </View>

        <View style={styles.budgetSection}>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Budget: ₹{campaign.budget.totalBudget.toLocaleString()}</Text>
            <Text style={styles.budgetLabel}>Revenue: ₹{campaign.performance.revenue.toLocaleString()}</Text>
          </View>
          <View style={styles.targetingInfo}>
            <Text style={styles.targetingText}>
              Targeting: {campaign.targeting.userTypes.join(', ')}
            </Text>
            <Text style={styles.sponsorText}>by {campaign.sponsor}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getTypeColor = (type: string) => {
    const colors = {
      banner: '#2196F3',
      interstitial: '#FF9800',
      native: '#4CAF50',
      video: '#9C27B0',
      sponsored_content: '#FF6B35',
    };
    return colors[type as keyof typeof colors] || '#7F8C8D';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
    };
    return colors[priority as keyof typeof colors] || '#7F8C8D';
  };

  const CreateCampaignModal = () => (
    <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingCampaign ? 'Edit Campaign' : 'Create Ad Campaign'}
          </Text>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Basic Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Campaign Title *</Text>
              <TextInput
                style={styles.formInput}
                value={campaignForm.title}
                onChangeText={(text) => setCampaignForm(prev => ({ ...prev, title: text }))}
                placeholder="Enter campaign title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={campaignForm.description}
                onChangeText={(text) => setCampaignForm(prev => ({ ...prev, description: text }))}
                placeholder="Describe your ad campaign..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Sponsor Name *</Text>
              <TextInput
                style={styles.formInput}
                value={campaignForm.sponsor}
                onChangeText={(text) => setCampaignForm(prev => ({ ...prev, sponsor: text }))}
                placeholder="Company or brand name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Action Text</Text>
              <TextInput
                style={styles.formInput}
                value={campaignForm.actionText}
                onChangeText={(text) => setCampaignForm(prev => ({ ...prev, actionText: text }))}
                placeholder="e.g., Order Now, Learn More"
              />
            </View>
          </View>

          {/* Ad Type & Category */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Ad Configuration</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ad Type</Text>
              <View style={styles.typeSelector}>
                {AD_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      campaignForm.type === type.id && styles.selectedTypeOption
                    ]}
                    onPress={() => setCampaignForm(prev => ({ ...prev, type: type.id as any }))}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      campaignForm.type === type.id && styles.selectedTypeOptionText
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={styles.typeDescription}>{type.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      campaignForm.category === category.id && styles.selectedCategoryOption
                    ]}
                    onPress={() => setCampaignForm(prev => ({ ...prev, category: category.id as any }))}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      campaignForm.category === category.id && styles.selectedCategoryOptionText
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      campaignForm.priority === priority && styles.selectedPriorityOption,
                      { borderColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setCampaignForm(prev => ({ ...prev, priority: priority as any }))}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      campaignForm.priority === priority && { color: getPriorityColor(priority) }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Targeting */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Targeting</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target User Types</Text>
              <View style={styles.userTypeSelector}>
                {USER_TYPES.map((userType) => (
                  <TouchableOpacity
                    key={userType.id}
                    style={[
                      styles.userTypeOption,
                      campaignForm.targetUserTypes.includes(userType.id) && styles.selectedUserTypeOption
                    ]}
                    onPress={() => toggleUserType(userType.id)}
                  >
                    <Text style={[
                      styles.userTypeOptionText,
                      campaignForm.targetUserTypes.includes(userType.id) && styles.selectedUserTypeOptionText
                    ]}>
                      {userType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Budget */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Budget & Pricing</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.formLabel}>Total Budget (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  value={campaignForm.totalBudget}
                  onChangeText={(text) => setCampaignForm(prev => ({ ...prev, totalBudget: text }))}
                  placeholder="50000"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.formLabel}>Cost Per Click (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  value={campaignForm.costPerClick}
                  onChangeText={(text) => setCampaignForm(prev => ({ ...prev, costPerClick: text }))}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cost Per View (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={campaignForm.costPerView}
                onChangeText={(text) => setCampaignForm(prev => ({ ...prev, costPerView: text }))}
                placeholder="0.5"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.formLabel}>Start Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={campaignForm.startDate}
                  onChangeText={(text) => setCampaignForm(prev => ({ ...prev, startDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.formLabel}>End Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={campaignForm.endDate}
                  onChangeText={(text) => setCampaignForm(prev => ({ ...prev, endDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveCampaign}>
            <Text style={styles.saveButtonText}>
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const filteredCampaigns = campaigns.filter(campaign => {
    const status = getCampaignStatus(campaign);
    return selectedTab === 'active' ? status === 'active' : 
           selectedTab === 'completed' ? status === 'completed' : 
           status === 'scheduled';
  });

  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.performance.revenue, 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.performance.impressions, 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.performance.clicks, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ad Campaign Management</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateCampaign}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Analytics Overview */}
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsTitle}>Campaign Performance</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <DollarSign size={20} color="#4CAF50" />
            <Text style={styles.analyticsValue}>₹{totalRevenue.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Total Revenue</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Eye size={20} color="#2196F3" />
            <Text style={styles.analyticsValue}>{totalImpressions.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Impressions</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Target size={20} color="#FF9800" />
            <Text style={styles.analyticsValue}>{totalClicks}</Text>
            <Text style={styles.analyticsLabel}>Clicks</Text>
          </View>
          <View style={styles.analyticsCard}>
            <TrendingUp size={20} color="#9C27B0" />
            <Text style={styles.analyticsValue}>
              {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'}%
            </Text>
            <Text style={styles.analyticsLabel}>Avg CTR</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['active', 'paused', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({filteredCampaigns.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map(renderCampaignCard)
        ) : (
          <View style={styles.emptyState}>
            <BarChart3 size={60} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No {selectedTab} campaigns</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedTab === 'active' && 'Create your first ad campaign to start generating revenue'}
              {selectedTab === 'paused' && 'Paused campaigns will appear here'}
              {selectedTab === 'completed' && 'Completed campaigns will be listed here'}
            </Text>
          </View>
        )}
      </ScrollView>

      <CreateCampaignModal />
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
  createButton: {
    backgroundColor: '#FF6B35',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsSection: {
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
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginVertical: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: 6,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  campaignActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  campaignDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  campaignImage: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 6,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  metricLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
  },
  budgetSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  targetingInfo: {
    alignItems: 'flex-end',
  },
  targetingText: {
    fontSize: 11,
    color: '#2196F3',
    marginBottom: 2,
  },
  sponsorText: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
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
    paddingHorizontal: 40,
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
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color: '#2C3E50',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    gap: 8,
  },
  typeOption: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTypeOption: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FF6B35',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  selectedTypeOptionText: {
    color: '#FF6B35',
  },
  typeDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  selectedCategoryOption: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FF6B35',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedCategoryOptionText: {
    color: '#FF6B35',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedPriorityOption: {
    backgroundColor: '#FFF5F0',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  userTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  userTypeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedUserTypeOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  userTypeOptionText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedUserTypeOptionText: {
    color: '#2196F3',
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