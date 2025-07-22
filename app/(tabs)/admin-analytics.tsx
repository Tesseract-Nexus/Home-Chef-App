import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Clock, Star, MapPin, X, Download, Filter, Calendar, ChartPie as PieChart, ChartBar as BarChart3 } from 'lucide-react-native';

const ANALYTICS_DATA = {
  overview: {
    totalRevenue: 2456780,
    totalOrders: 12456,
    activeUsers: 8934,
    avgOrderValue: 197,
    customerRetention: 68,
    chefRetention: 85,
    deliveryPartners: 234,
    avgDeliveryTime: 42,
  },
  growth: {
    revenueGrowth: 23.5,
    orderGrowth: 18.2,
    userGrowth: 15.7,
    chefGrowth: 12.3,
  },
  topPerformers: {
    chefs: [
      { name: 'Priya Sharma', orders: 456, revenue: 89600, rating: 4.9 },
      { name: 'Meera Patel', orders: 389, revenue: 76800, rating: 4.8 },
      { name: 'Lakshmi Reddy', orders: 334, revenue: 65400, rating: 4.7 },
    ],
    cities: [
      { name: 'Mumbai', orders: 3456, revenue: 678900 },
      { name: 'Delhi', orders: 2890, revenue: 567800 },
      { name: 'Bangalore', orders: 2234, revenue: 445600 },
    ],
    cuisines: [
      { name: 'North Indian', orders: 4567, percentage: 36.7 },
      { name: 'South Indian', orders: 3234, percentage: 26.0 },
      { name: 'Gujarati', orders: 2456, percentage: 19.7 },
    ],
  },
  timeAnalytics: {
    peakHours: [
      { hour: '12:00-13:00', orders: 1234 },
      { hour: '19:00-20:00', orders: 1456 },
      { hour: '20:00-21:00', orders: 1678 },
    ],
    weeklyTrends: [
      { day: 'Mon', orders: 1456, revenue: 287600 },
      { day: 'Tue', orders: 1234, revenue: 243800 },
      { day: 'Wed', orders: 1567, revenue: 309400 },
      { day: 'Thu', orders: 1789, revenue: 353200 },
      { day: 'Fri', orders: 2134, revenue: 421800 },
      { day: 'Sat', orders: 2456, revenue: 485200 },
      { day: 'Sun', orders: 1890, revenue: 373000 },
    ],
  },
};

export default function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const renderMetricCard = (title: string, value: string, icon: any, color: string, growth?: number) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity 
        style={styles.metricCard}
        onPress={() => {
          setSelectedMetric(title);
          setShowDetailModal(true);
        }}
      >
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={24} color={color} />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
          {growth !== undefined && (
            <View style={styles.growthContainer}>
              {growth >= 0 ? (
                <TrendingUp size={12} color="#4CAF50" />
              ) : (
                <TrendingDown size={12} color="#F44336" />
              )}
              <Text style={[styles.growthText, { color: growth >= 0 ? '#4CAF50' : '#F44336' }]}>
                {growth >= 0 ? '+' : ''}{growth}%
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopPerformerCard = (title: string, data: any[], type: 'chef' | 'city' | 'cuisine') => (
    <View style={styles.performerSection}>
      <Text style={styles.performerTitle}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.performerCard}>
          <View style={styles.performerRank}>
            <Text style={styles.rankNumber}>{index + 1}</Text>
          </View>
          <View style={styles.performerInfo}>
            <Text style={styles.performerName}>{item.name}</Text>
            <View style={styles.performerStats}>
              {type === 'chef' && (
                <>
                  <Text style={styles.performerStat}>{item.orders} orders</Text>
                  <Text style={styles.performerStat}>₹{item.revenue.toLocaleString()}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </>
              )}
              {type === 'city' && (
                <>
                  <Text style={styles.performerStat}>{item.orders} orders</Text>
                  <Text style={styles.performerStat}>₹{item.revenue.toLocaleString()}</Text>
                </>
              )}
              {type === 'cuisine' && (
                <>
                  <Text style={styles.performerStat}>{item.orders} orders</Text>
                  <Text style={styles.performerStat}>{item.percentage}%</Text>
                </>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderWeeklyChart = () => {
    const maxOrders = Math.max(...ANALYTICS_DATA.timeAnalytics.weeklyTrends.map(d => d.orders));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Order Trends</Text>
        <View style={styles.chart}>
          {ANALYTICS_DATA.timeAnalytics.weeklyTrends.map((day, index) => {
            const height = (day.orders / maxOrders) * 120;
            return (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartBarContainer}>
                  <View style={[styles.chartBar, { height }]} />
                </View>
                <Text style={styles.chartDay}>{day.day}</Text>
                <Text style={styles.chartOrders}>{day.orders}</Text>
                <Text style={styles.chartRevenue}>₹{(day.revenue / 1000).toFixed(0)}K</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const DetailModal = () => (
    <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedMetric} - Detailed Analytics</Text>
          <TouchableOpacity onPress={() => setShowDetailModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Trend Analysis</Text>
            <Text style={styles.detailDescription}>
              Detailed breakdown and insights for {selectedMetric.toLowerCase()} over the selected period.
            </Text>
            
            <View style={styles.trendChart}>
              <Text style={styles.trendTitle}>30-Day Trend</Text>
              {/* Placeholder for detailed chart */}
              <View style={styles.chartPlaceholder}>
                <BarChart3 size={48} color="#E0E0E0" />
                <Text style={styles.chartPlaceholderText}>Detailed chart would be rendered here</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics & Insights</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period as typeof selectedPeriod)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Total Revenue',
              `₹${(ANALYTICS_DATA.overview.totalRevenue / 100000).toFixed(1)}L`,
              DollarSign,
              '#4CAF50',
              ANALYTICS_DATA.growth.revenueGrowth
            )}
            {renderMetricCard(
              'Total Orders',
              ANALYTICS_DATA.overview.totalOrders.toLocaleString(),
              ShoppingBag,
              '#2196F3',
              ANALYTICS_DATA.growth.orderGrowth
            )}
            {renderMetricCard(
              'Active Users',
              ANALYTICS_DATA.overview.activeUsers.toLocaleString(),
              Users,
              '#FF6B35',
              ANALYTICS_DATA.growth.userGrowth
            )}
            {renderMetricCard(
              'Avg Order Value',
              `₹${ANALYTICS_DATA.overview.avgOrderValue}`,
              TrendingUp,
              '#9C27B0'
            )}
            {renderMetricCard(
              'Customer Retention',
              `${ANALYTICS_DATA.overview.customerRetention}%`,
              Users,
              '#00BCD4'
            )}
            {renderMetricCard(
              'Avg Delivery Time',
              `${ANALYTICS_DATA.overview.avgDeliveryTime} min`,
              Clock,
              '#FF9800'
            )}
          </View>
        </View>

        {/* Weekly Trends Chart */}
        {renderWeeklyChart()}

        {/* Top Performers */}
        <View style={styles.performersSection}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.performersGrid}>
            {renderTopPerformerCard('Top Chefs', ANALYTICS_DATA.topPerformers.chefs, 'chef')}
            {renderTopPerformerCard('Top Cities', ANALYTICS_DATA.topPerformers.cities, 'city')}
            {renderTopPerformerCard('Popular Cuisines', ANALYTICS_DATA.topPerformers.cuisines, 'cuisine')}
          </View>
        </View>

        {/* Peak Hours Analysis */}
        <View style={styles.peakHoursSection}>
          <Text style={styles.sectionTitle}>Peak Hours Analysis</Text>
          <View style={styles.peakHoursContainer}>
            {ANALYTICS_DATA.timeAnalytics.peakHours.map((hour, index) => (
              <View key={index} style={styles.peakHourCard}>
                <Text style={styles.peakHourTime}>{hour.hour}</Text>
                <Text style={styles.peakHourOrders}>{hour.orders} orders</Text>
                <View style={styles.peakHourBar}>
                  <View 
                    style={[
                      styles.peakHourBarFill,
                      { width: `${(hour.orders / 1678) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Business Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color="#4CAF50" />
              <Text style={styles.insightTitle}>Revenue Growth</Text>
            </View>
            <Text style={styles.insightText}>
              Platform revenue has grown by 23.5% this month, driven by increased order volume and new chef onboarding.
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Users size={20} color="#2196F3" />
              <Text style={styles.insightTitle}>Customer Behavior</Text>
            </View>
            <Text style={styles.insightText}>
              Peak ordering times are lunch (12-1 PM) and dinner (7-9 PM). Weekend orders are 35% higher than weekdays.
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Star size={20} color="#FFD700" />
              <Text style={styles.insightTitle}>Quality Metrics</Text>
            </View>
            <Text style={styles.insightText}>
              Average chef rating is 4.7/5 with 85% customer satisfaction. Delivery time has improved by 12% this quarter.
            </Text>
          </View>
        </View>
      </ScrollView>

      <DetailModal />
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#FF6B35',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricInfo: {
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBar: {
    backgroundColor: '#FF6B35',
    width: 20,
    borderRadius: 10,
  },
  chartDay: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 2,
  },
  chartOrders: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  chartRevenue: {
    fontSize: 9,
    color: '#4CAF50',
    fontWeight: '600',
  },
  performersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  performersGrid: {
    gap: 16,
  },
  performerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  performerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performerRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  performerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  performerStat: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  peakHoursSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  peakHoursContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  peakHourCard: {
    marginBottom: 16,
  },
  peakHourTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  peakHourOrders: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  peakHourBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
  },
  peakHourBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  insightText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
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
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  trendChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#BDC3C7',
  },
});