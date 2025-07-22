import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Clock, Truck, Star, Award } from 'lucide-react-native';
import { useTipping } from '@/hooks/useTipping';
import { useAuth } from '@/hooks/useAuth';

interface EarningsData {
  period: string;
  totalEarnings: number;
  deliveries: number;
  tips: number;
  directTips: number;
  bonuses: number;
  avgEarningsPerDelivery: number;
  avgRating: number;
  onTimePercentage: number;
}

const EARNINGS_DATA: { [key: string]: EarningsData } = {
  today: {
    period: 'Today',
    totalEarnings: 1240,
    deliveries: 12,
    tips: 180,
    directTips: 120,
    bonuses: 50,
    avgEarningsPerDelivery: 103,
    avgRating: 4.8,
    onTimePercentage: 95,
  },
  week: {
    period: 'This Week',
    totalEarnings: 8650,
    deliveries: 47,
    tips: 1250,
    directTips: 890,
    bonuses: 300,
    avgEarningsPerDelivery: 184,
    avgRating: 4.7,
    onTimePercentage: 92,
  },
  month: {
    period: 'This Month',
    totalEarnings: 32400,
    deliveries: 186,
    tips: 4800,
    directTips: 3200,
    bonuses: 1200,
    avgEarningsPerDelivery: 174,
    avgRating: 4.6,
    onTimePercentage: 89,
  },
};

const DAILY_EARNINGS = [
  { day: 'Mon', earnings: 1450, deliveries: 14 },
  { day: 'Tue', earnings: 1200, deliveries: 11 },
  { day: 'Wed', earnings: 1680, deliveries: 16 },
  { day: 'Thu', earnings: 1350, deliveries: 13 },
  { day: 'Fri', earnings: 1820, deliveries: 18 },
  { day: 'Sat', earnings: 2100, deliveries: 21 },
  { day: 'Sun', earnings: 1850, deliveries: 19 },
];

const BONUS_CATEGORIES = [
  { type: 'Peak Hour Bonus', amount: 150, description: 'Extra earnings during rush hours' },
  { type: 'Distance Bonus', amount: 80, description: 'Long distance delivery rewards' },
  { type: 'Rating Bonus', amount: 120, description: 'High customer rating incentive' },
  { type: 'Completion Bonus', amount: 100, description: 'Daily delivery target achieved' },
];

export default function DeliveryEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const { user } = useAuth();
  const { getTotalTipsReceived, getTipsReceived } = useTipping();
  const currentData = EARNINGS_DATA[selectedPeriod];

  const renderEarningsCard = (title: string, value: string, icon: any, color: string, subtitle?: string) => {
    const IconComponent = icon;
    return (
      <View style={styles.earningsCard}>
        <View style={[styles.earningsIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={24} color={color} />
        </View>
        <View style={styles.earningsInfo}>
          <Text style={styles.earningsValue}>{value}</Text>
          <Text style={styles.earningsTitle}>{title}</Text>
          {subtitle && <Text style={styles.earningsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  };

  const renderDailyChart = () => {
    const maxEarnings = Math.max(...DAILY_EARNINGS.map(d => d.earnings));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Earnings Trend</Text>
        <View style={styles.chart}>
          {DAILY_EARNINGS.map((day, index) => {
            const height = (day.earnings / maxEarnings) * 120;
            return (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartBarContainer}>
                  <View style={[styles.chartBar, { height }]} />
                </View>
                <Text style={styles.chartDay}>{day.day}</Text>
                <Text style={styles.chartEarnings}>₹{day.earnings}</Text>
                <Text style={styles.chartDeliveries}>{day.deliveries} orders</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderBonusCard = (bonus: typeof BONUS_CATEGORIES[0], index: number) => (
    <View key={index} style={styles.bonusCard}>
      <View style={styles.bonusIcon}>
        <Award size={20} color="#FF9800" />
      </View>
      <View style={styles.bonusInfo}>
        <Text style={styles.bonusType}>{bonus.type}</Text>
        <Text style={styles.bonusDescription}>{bonus.description}</Text>
      </View>
      <Text style={styles.bonusAmount}>+₹{bonus.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings & Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((period) => (
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

        {/* Main Earnings Overview */}
        <View style={styles.mainEarningsCard}>
          <View style={styles.mainEarningsHeader}>
            <Text style={styles.mainEarningsTitle}>{currentData.period} Earnings</Text>
            <View style={styles.trendIndicator}>
              <TrendingUp size={16} color="#4CAF50" />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
          <Text style={styles.mainEarningsValue}>₹{currentData.totalEarnings.toLocaleString()}</Text>
          <Text style={styles.mainEarningsSubtitle}>
            {currentData.deliveries} deliveries • ₹{currentData.avgEarningsPerDelivery} avg per delivery
          </Text>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.earningsSection}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.earningsGrid}>
            {renderEarningsCard(
              'Base Earnings',
              `₹${(currentData.totalEarnings - currentData.tips - currentData.bonuses).toLocaleString()}`,
              DollarSign,
              '#2196F3',
              'Delivery fees'
            )}
            {renderEarningsCard(
              'Tips Received',
              `₹${(currentData.tips + currentData.directTips).toLocaleString()}`,
              TrendingUp,
              '#4CAF50',
              `Platform: ₹${currentData.tips} • Direct: ₹${currentData.directTips}`
            )}
            {renderEarningsCard(
              'Bonuses',
              `₹${currentData.bonuses.toLocaleString()}`,
              Award,
              '#FF9800',
              'Performance bonuses'
            )}
            {renderEarningsCard(
              'Deliveries',
              currentData.deliveries.toString(),
              Truck,
              '#9C27B0',
              'Total completed'
            )}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceIcon}>
                <Star size={20} color="#FFD700" />
              </View>
              <Text style={styles.performanceValue}>{currentData.avgRating}</Text>
              <Text style={styles.performanceLabel}>Avg Rating</Text>
            </View>
            <View style={styles.performanceCard}>
              <View style={styles.performanceIcon}>
                <Clock size={20} color="#4CAF50" />
              </View>
              <Text style={styles.performanceValue}>{currentData.onTimePercentage}%</Text>
              <Text style={styles.performanceLabel}>On-time Delivery</Text>
            </View>
            <View style={styles.performanceCard}>
              <View style={styles.performanceIcon}>
                <DollarSign size={20} color="#2196F3" />
              </View>
              <Text style={styles.performanceValue}>₹{currentData.avgEarningsPerDelivery}</Text>
              <Text style={styles.performanceLabel}>Per Delivery</Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        {selectedPeriod === 'week' && renderDailyChart()}

        {/* Bonus Breakdown */}
        <View style={styles.bonusSection}>
          <Text style={styles.sectionTitle}>Bonus Breakdown</Text>
          {BONUS_CATEGORIES.map(renderBonusCard)}
        </View>

        {/* Payout Information */}
        <View style={styles.payoutSection}>
          <Text style={styles.sectionTitle}>Payout Information</Text>
          <View style={styles.payoutCard}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Next Payout</Text>
              <Text style={styles.payoutValue}>₹{currentData.totalEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Payout Date</Text>
              <Text style={styles.payoutValue}>Every Friday</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Payment Method</Text>
              <Text style={styles.payoutValue}>Bank Transfer</Text>
            </View>
            <TouchableOpacity style={styles.payoutButton}>
              <Text style={styles.payoutButtonText}>View Payout History</Text>
            </TouchableOpacity>
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
  mainEarningsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainEarningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainEarningsTitle: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mainEarningsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  mainEarningsSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  earningsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  earningsCard: {
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
  earningsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  earningsInfo: {
    alignItems: 'flex-start',
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  earningsTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  earningsSubtitle: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  performanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
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
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
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
  chartEarnings: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  chartDeliveries: {
    fontSize: 9,
    color: '#7F8C8D',
  },
  bonusSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bonusCard: {
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
  bonusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bonusInfo: {
    flex: 1,
  },
  bonusType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  bonusDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  payoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  payoutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  payoutButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});