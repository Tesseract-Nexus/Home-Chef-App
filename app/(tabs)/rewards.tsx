import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Gift, Crown, Star, Calendar, TrendingUp, X, Check, Zap, Truck, Shield, Clock } from 'lucide-react-native';
import { useRewards } from '@/hooks/useRewards';
import { isFeatureEnabled } from '@/config/featureFlags';

const REWARD_TIERS = [
  { min: 0, max: 499, name: 'Bronze', color: '#CD7F32', icon: '🥉' },
  { min: 500, max: 1499, name: 'Silver', color: '#C0C0C0', icon: '🥈' },
  { min: 1500, max: 2999, name: 'Gold', color: '#FFD700', icon: '🥇' },
  { min: 3000, max: Infinity, name: 'Platinum', color: '#E5E4E2', icon: '💎' },
];

const REDEMPTION_OPTIONS = [
  { tokens: 100, discount: 50, description: '₹50 off on orders above ₹300' },
  { tokens: 200, discount: 100, description: '₹100 off on orders above ₹500' },
  { tokens: 400, discount: 200, description: '₹200 off on orders above ₹800' },
  { tokens: 600, discount: 300, description: '₹300 off on orders above ₹1000' },
  { tokens: 1000, discount: 500, description: '₹500 off on orders above ₹1500' },
];

export default function RewardsScreen() {
  const { 
    rewards, 
    subscriptionPlans, 
    isSubscriptionEnabled, 
    redeemTokens, 
    subscribeToPlan,
    getDiscountForTokens 
  } = useRewards();
  
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<typeof REDEMPTION_OPTIONS[0] | null>(null);

  if (!isFeatureEnabled('ENABLE_REWARDS_SYSTEM')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Award size={60} color="#BDC3C7" />
          <Text style={styles.disabledTitle}>Rewards System</Text>
          <Text style={styles.disabledText}>
            The rewards system is currently disabled. Check back later for exciting rewards and offers!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getCurrentTier = () => {
    return REWARD_TIERS.find(tier => 
      rewards.lifetimeEarned >= tier.min && rewards.lifetimeEarned < tier.max
    ) || REWARD_TIERS[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = REWARD_TIERS.indexOf(currentTier);
    return currentIndex < REWARD_TIERS.length - 1 ? REWARD_TIERS[currentIndex + 1] : null;
  };

  const handleRedemption = async (option: typeof REDEMPTION_OPTIONS[0]) => {
    if (rewards.totalTokens < option.tokens) {
      Alert.alert('Insufficient Tokens', `You need ${option.tokens} tokens for this reward.`);
      return;
    }

    const success = await redeemTokens(option.tokens, option.description);
    if (success) {
      Alert.alert('Reward Redeemed!', `You've successfully redeemed ${option.description}`);
      setShowRedemptionModal(false);
    }
  };

  const handleSubscription = async (planId: string) => {
    Alert.alert(
      'Subscribe to Plan',
      'Are you sure you want to subscribe to this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: async () => {
            await subscribeToPlan(planId);
            setShowSubscriptionModal(false);
            Alert.alert('Success!', 'You have successfully subscribed to the plan.');
          }
        }
      ]
    );
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  const renderRewardCard = () => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View style={styles.tokenSection}>
          <Award size={32} color="#FF6B35" />
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenCount}>{rewards.totalTokens}</Text>
            <Text style={styles.tokenLabel}>Available Tokens</Text>
          </View>
        </View>
        <View style={styles.tierSection}>
          <Text style={styles.tierEmoji}>{currentTier.icon}</Text>
          <Text style={[styles.tierName, { color: currentTier.color }]}>{currentTier.name}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        {nextTier && (
          <>
            <Text style={styles.progressText}>
              {nextTier.min - rewards.lifetimeEarned} tokens to {nextTier.name}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(100, (rewards.lifetimeEarned / nextTier.min) * 100)}%`,
                    backgroundColor: nextTier.color 
                  }
                ]} 
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rewards.lifetimeEarned}</Text>
          <Text style={styles.statLabel}>Lifetime Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rewards.currentStreak}</Text>
          <Text style={styles.statLabel}>Order Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rewards.lifetimeRedeemed}</Text>
          <Text style={styles.statLabel}>Total Redeemed</Text>
        </View>
      </View>
    </View>
  );

  const renderRedemptionOptions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Redeem Tokens</Text>
        <TouchableOpacity onPress={() => setShowRedemptionModal(true)}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {REDEMPTION_OPTIONS.slice(0, 3).map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.redemptionCard,
              rewards.totalTokens < option.tokens && styles.disabledRedemption
            ]}
            onPress={() => handleRedemption(option)}
            disabled={rewards.totalTokens < option.tokens}
          >
            <Gift size={24} color={rewards.totalTokens >= option.tokens ? "#4CAF50" : "#BDC3C7"} />
            <Text style={styles.redemptionTokens}>{option.tokens} tokens</Text>
            <Text style={styles.redemptionDiscount}>₹{option.discount} OFF</Text>
            <Text style={styles.redemptionDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSubscriptionSection = () => {
    if (!isSubscriptionEnabled) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Premium Subscription</Text>
          <TouchableOpacity onPress={() => setShowSubscriptionModal(true)}>
            <Text style={styles.seeAllText}>View Plans</Text>
          </TouchableOpacity>
        </View>
        
        {rewards.subscription?.isActive ? (
          <View style={styles.activeSubscriptionCard}>
            <Crown size={24} color="#FFD700" />
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>Premium Active</Text>
              <Text style={styles.subscriptionDetails}>
                Expires: {rewards.subscription.endDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.subscriptionBenefits}>
              <Text style={styles.benefitText}>✨ 3x Token Rewards</Text>
              <Text style={styles.benefitText}>🚀 Priority Delivery</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.subscriptionPromo}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <Crown size={32} color="#FFD700" />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Upgrade to Premium</Text>
              <Text style={styles.promoSubtitle}>Get 3x tokens, priority delivery & more!</Text>
            </View>
            <Text style={styles.promoPrice}>From ₹99/mo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTransactionHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {rewards.transactions.slice(0, 5).map((transaction) => (
        <View key={transaction.id} style={styles.transactionItem}>
          <View style={[
            styles.transactionIcon,
            { backgroundColor: transaction.type === 'earned' ? '#E8F5E8' : '#FFF3E0' }
          ]}>
            {transaction.type === 'earned' ? (
              <TrendingUp size={16} color="#4CAF50" />
            ) : (
              <Gift size={16} color="#FF6B35" />
            )}
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{transaction.description}</Text>
            <Text style={styles.transactionDate}>
              {transaction.date.toLocaleDateString()}
            </Text>
          </View>
          <Text style={[
            styles.transactionAmount,
            { color: transaction.type === 'earned' ? '#4CAF50' : '#FF6B35' }
          ]}>
            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
          </Text>
        </View>
      ))}
    </View>
  );

  const RedemptionModal = () => (
    <Modal visible={showRedemptionModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Redeem Tokens</Text>
          <TouchableOpacity onPress={() => setShowRedemptionModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.tokenBalance}>
            <Award size={24} color="#FF6B35" />
            <Text style={styles.balanceText}>Available: {rewards.totalTokens} tokens</Text>
          </View>

          {REDEMPTION_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.fullRedemptionCard,
                rewards.totalTokens < option.tokens && styles.disabledRedemption
              ]}
              onPress={() => handleRedemption(option)}
              disabled={rewards.totalTokens < option.tokens}
            >
              <View style={styles.redemptionLeft}>
                <Gift size={24} color={rewards.totalTokens >= option.tokens ? "#4CAF50" : "#BDC3C7"} />
                <View style={styles.redemptionInfo}>
                  <Text style={styles.redemptionTitle}>₹{option.discount} Discount</Text>
                  <Text style={styles.redemptionDesc}>{option.description}</Text>
                </View>
              </View>
              <View style={styles.redemptionRight}>
                <Text style={styles.redemptionCost}>{option.tokens} tokens</Text>
                {rewards.totalTokens >= option.tokens && (
                  <Check size={16} color="#4CAF50" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const SubscriptionModal = () => (
    <Modal visible={showSubscriptionModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Premium Plans</Text>
          <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {subscriptionPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Crown size={24} color="#FFD700" />
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    ₹{plan.price}/{plan.duration === 'monthly' ? 'month' : plan.duration === 'halfyearly' ? '6 months' : 'year'}
                  </Text>
                </View>
                {(plan.duration === 'yearly' || plan.duration === 'halfyearly') && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                      {plan.duration === 'yearly' ? 'Best Value' : 'Save ₹500'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.benefitsList}>
                {plan.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => handleSubscription(plan.id)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderRewardCard()}
        {renderRedemptionOptions()}
        {renderSubscriptionSection()}
        {renderTransactionHistory()}
      </ScrollView>

      <RedemptionModal />
      <SubscriptionModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 12,
  },
  disabledText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenInfo: {
    marginLeft: 12,
  },
  tokenCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  tokenLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  tierSection: {
    alignItems: 'center',
  },
  tierEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  tierName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  redemptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledRedemption: {
    opacity: 0.5,
  },
  redemptionTokens: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
  },
  redemptionDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  redemptionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  activeSubscriptionCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  subscriptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subscriptionDetails: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  subscriptionBenefits: {
    marginTop: 12,
  },
  benefitText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  subscriptionPromo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoContent: {
    flex: 1,
    marginLeft: 16,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  promoPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
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
  tokenBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  balanceText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  fullRedemptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  redemptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  redemptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  redemptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  redemptionDesc: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  redemptionRight: {
    alignItems: 'center',
  },
  redemptionCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  planCard: {
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginLeft: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  planPrice: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});