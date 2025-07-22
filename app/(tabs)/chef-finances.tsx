import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, X, Receipt, ChartPie as PieChart, ChartBar as BarChart3, Download, Filter } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTipping } from '@/hooks/useTipping';
import { PLATFORM_CONFIG } from '@/config/featureFlags';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  orderId?: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalTips: number;
  netProfit: number;
  profitMargin: number;
  orderCount: number;
  avgOrderValue: number;
  platformFees: number;
  grossRevenue: number;
}

const EXPENSE_CATEGORIES = [
  'Ingredients & Raw Materials',
  'Packaging & Containers',
  'Gas & Utilities',
  'Equipment & Utensils',
  'Delivery Charges',
  'Platform Commission',
  'Marketing & Promotion',
  'Maintenance & Repairs',
  'Other Expenses'
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'Order Revenue',
    amount: 2450,
    description: 'Daily order revenue',
    date: new Date(),
    orderId: 'ORD125'
  },
  {
    id: '1a',
    type: 'expense',
    category: 'Platform Commission',
    amount: 367,
    description: 'Platform fee (15% of order value)',
    date: new Date(),
  },
  {
    id: '2',
    type: 'expense',
    category: 'Ingredients & Raw Materials',
    amount: 800,
    description: 'Chicken, vegetables, spices',
    date: new Date(),
  },
  {
    id: '3',
    type: 'expense',
    category: 'Packaging & Containers',
    amount: 150,
    description: 'Food containers and bags',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'income',
    category: 'Order Revenue',
    amount: 1890,
    description: 'Yesterday order revenue',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

export default function ChefFinances() {
  const { user } = useAuth();
  const { getTotalTipsReceived } = useTipping();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReports, setShowReports] = useState(false);
  
  const [expenseForm, setExpenseForm] = useState({
    category: 'Ingredients & Raw Materials',
    amount: '',
    description: '',
  });

  // Calculate financial summary based on selected period
  const getFinancialSummary = (): FinancialSummary => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filteredTransactions = transactions.filter(t => t.date >= startDate);
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const tips = user ? getTotalTipsReceived(user.id, selectedPeriod === 'daily' ? 'today' : selectedPeriod === 'weekly' ? 'week' : 'month') : 0;
    const platformFees = filteredTransactions.filter(t => t.category === 'Platform Commission').reduce((sum, t) => sum + t.amount, 0);
    const orderCount = filteredTransactions.filter(t => t.type === 'income' && t.orderId).length;
    const grossRevenue = income + tips;

    return {
      totalIncome: income,
      totalTips: tips,
      totalExpenses: expenses,
      platformFees,
      grossRevenue,
      netProfit: grossRevenue - expenses,
      profitMargin: grossRevenue > 0 ? ((grossRevenue - expenses) / grossRevenue) * 100 : 0,
      orderCount,
      avgOrderValue: orderCount > 0 ? income / orderCount : 0,
    };
  };

  const summary = getFinancialSummary();

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newExpense: Transaction = {
      id: Date.now().toString(),
      type: 'expense',
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      date: new Date(),
    };

    setTransactions(prev => [newExpense, ...prev]);
    setExpenseForm({ category: 'Ingredients & Raw Materials', amount: '', description: '' });
    setShowAddExpense(false);
    Alert.alert('Success', 'Expense added successfully!');
  };

  const getExpensesByCategory = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0
    }));
  };

  const renderSummaryCard = (title: string, value: string, icon: any, color: string, subtitle?: string) => {
    const IconComponent = icon;
    return (
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={24} color={color} />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryValue}>{value}</Text>
          <Text style={styles.summaryTitle}>{title}</Text>
          {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  };

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: transaction.type === 'income' ? '#E8F5E8' : '#FFEBEE' }
        ]}>
          {transaction.type === 'income' ? (
            <TrendingUp size={16} color="#4CAF50" />
          ) : (
            <TrendingDown size={16} color="#F44336" />
          )}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCategory}>{transaction.category}</Text>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionDate}>
            {transaction.date.toLocaleDateString()} • {transaction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
        </Text>
      </View>
    </View>
  );

  const AddExpenseModal = () => (
    <Modal visible={showAddExpense} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Expense</Text>
          <TouchableOpacity onPress={() => setShowAddExpense(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {EXPENSE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    expenseForm.category === category && styles.selectedCategoryChip
                  ]}
                  onPress={() => setExpenseForm(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    expenseForm.category === category && styles.selectedCategoryChipText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.formInput}
              value={expenseForm.amount}
              onChangeText={(text) => setExpenseForm(prev => ({ ...prev, amount: text }))}
              placeholder="Enter amount"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={expenseForm.description}
              onChangeText={(text) => setExpenseForm(prev => ({ ...prev, description: text }))}
              placeholder="Describe the expense..."
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const ReportsModal = () => (
    <Modal visible={showReports} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Financial Reports</Text>
          <TouchableOpacity onPress={() => setShowReports(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* P&L Statement */}
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>Profit & Loss Statement</Text>
            <View style={styles.plStatement}>
              <View style={styles.plRow}>
                <Text style={styles.plLabel}>Total Revenue</Text>
                <Text style={styles.plValue}>₹{summary.grossRevenue.toLocaleString()}</Text>
              </View>
              <View style={styles.plRow}>
                <Text style={styles.plLabel}>  - Order Revenue</Text>
                <Text style={styles.plValue}>₹{summary.totalIncome.toLocaleString()}</Text>
              </View>
              <View style={styles.plRow}>
                <Text style={styles.plLabel}>  - Direct Tips</Text>
                <Text style={styles.plValue}>₹{summary.totalTips.toLocaleString()}</Text>
              </View>
              <View style={styles.plRow}>
                <Text style={styles.plLabel}>Platform Fees</Text>
                <Text style={[styles.plValue, { color: '#FF9800' }]}>₹{summary.platformFees.toLocaleString()}</Text>
              </View>
              <View style={styles.plRow}>
                <Text style={styles.plLabel}>Total Expenses</Text>
                <Text style={[styles.plValue, { color: '#F44336' }]}>₹{summary.totalExpenses.toLocaleString()}</Text>
              </View>
              <View style={[styles.plRow, styles.plTotal]}>
                <Text style={styles.plTotalLabel}>Net Profit</Text>
                <Text style={[styles.plTotalValue, { color: summary.netProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                  ₹{summary.netProfit.toLocaleString()}
                </Text>
              </View>
              <View style={styles.plRow}>
                <Text style={styles.plLabel}>Profit Margin</Text>
                <Text style={[styles.plValue, { color: summary.profitMargin >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {summary.profitMargin.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.platformFeeNote}>
                <Text style={styles.platformFeeNoteText}>
                  Platform fee: {PLATFORM_CONFIG.CHEF_COMMISSION_RATE * 100}% of order value
                </Text>
              </View>
            </View>
          </View>

          {/* Expense Breakdown */}
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>Expense Breakdown</Text>
            {getExpensesByCategory().map((item, index) => (
              <View key={index} style={styles.expenseBreakdownItem}>
                <Text style={styles.expenseCategory}>{item.category}</Text>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseAmount}>₹{item.amount.toLocaleString()}</Text>
                  <Text style={styles.expensePercentage}>{item.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Key Metrics */}
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{summary.orderCount}</Text>
                <Text style={styles.metricLabel}>Total Orders</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>₹{summary.avgOrderValue.toFixed(0)}</Text>
                <Text style={styles.metricLabel}>Avg Order Value</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ₹{summary.totalExpenses > 0 ? (summary.totalExpenses / summary.orderCount).toFixed(0) : '0'}
                </Text>
                <Text style={styles.metricLabel}>Cost per Order</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : '0'}%
                </Text>
                <Text style={styles.metricLabel}>Expense Ratio</Text>
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
        <Text style={styles.title}>Financial Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowReports(true)}
          >
            <BarChart3 size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowAddExpense(true)}
          >
            <Plus size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
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

        {/* Financial Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.summaryGrid}>
            {renderSummaryCard(
              'Total Income',
              `₹${summary.grossRevenue.toLocaleString()}`,
              TrendingUp,
              '#4CAF50',
              `Orders: ₹${summary.totalIncome.toLocaleString()} • Tips: ₹${summary.totalTips.toLocaleString()}`
            )}
            {renderSummaryCard(
              'Platform Fees',
              `₹${summary.platformFees.toLocaleString()}`,
              Receipt,
              '#FF9800',
              `${PLATFORM_CONFIG.CHEF_COMMISSION_RATE * 100}% commission`
            )}
            {renderSummaryCard(
              'Total Expenses',
              `₹${summary.totalExpenses.toLocaleString()}`,
              TrendingDown,
              '#F44336',
              'All categories'
            )}
            {renderSummaryCard(
              'Net Profit',
              `₹${summary.netProfit.toLocaleString()}`,
              DollarSign,
              summary.netProfit >= 0 ? '#4CAF50' : '#F44336',
              `${summary.profitMargin.toFixed(1)}% margin`
            )}
            {renderSummaryCard(
              'Avg Order Value',
              `₹${summary.avgOrderValue.toFixed(0)}`,
              Receipt,
              '#2196F3',
              'Per order'
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => setShowAddExpense(true)}
            >
              <Plus size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => setShowReports(true)}
            >
              <PieChart size={24} color="#2196F3" />
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Download size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Calendar size={24} color="#9C27B0" />
              <Text style={styles.actionText}>Tax Summary</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Filter size={20} color="#7F8C8D" />
            </TouchableOpacity>
          </View>
          {transactions.slice(0, 10).map(renderTransaction)}
        </View>

        {/* Expense Categories Overview */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          {getExpensesByCategory().slice(0, 5).map((item, index) => (
            <View key={index} style={styles.categoryOverviewItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.category}</Text>
                <Text style={styles.categoryAmount}>₹{item.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.categoryBar}>
                <View 
                  style={[
                    styles.categoryBarFill,
                    { width: `${item.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <AddExpenseModal />
      <ReportsModal />
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
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
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
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryInfo: {
    alignItems: 'flex-start',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
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
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryOverviewItem: {
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
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  categoryBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 4,
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reportSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  plStatement: {
    gap: 12,
  },
  plRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plTotal: {
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 16,
  },
  plLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  plValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  plTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  plTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  expenseDetails: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  expensePercentage: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  platformFeeNote: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  platformFeeNoteText: {
    fontSize: 12,
    color: '#F57C00',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});