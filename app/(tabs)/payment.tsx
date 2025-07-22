import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Smartphone, Building2, Banknote, Plus, X, Check, Shield, Clock } from 'lucide-react-native';

const PAYMENT_METHODS = [
  {
    id: 'card',
    title: 'Credit/Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
    color: '#4CAF50',
    popular: true,
  },
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'PhonePe, GPay, Paytm, BHIM',
    icon: Smartphone,
    color: '#FF6B35',
    popular: true,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'All major banks supported',
    icon: Building2,
    color: '#2196F3',
    popular: false,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay when you receive',
    icon: Banknote,
    color: '#9C27B0',
    popular: false,
  },
];

const SAVED_CARDS = [
  {
    id: 1,
    type: 'visa',
    last4: '4532',
    expiry: '12/26',
    name: 'JOHN DOE',
    isDefault: true,
  },
  {
    id: 2,
    type: 'mastercard',
    last4: '8901',
    expiry: '08/25',
    name: 'JOHN DOE',
    isDefault: false,
  },
];

const SAVED_UPI = [
  {
    id: 1,
    upiId: 'john@paytm',
    provider: 'Paytm',
    isDefault: true,
  },
  {
    id: 2,
    upiId: 'john@phonepe',
    provider: 'PhonePe',
    isDefault: false,
  },
];

const UPI_APPS = [
  { name: 'PhonePe', logo: '📱', color: '#5F259F' },
  { name: 'Google Pay', logo: '💳', color: '#4285F4' },
  { name: 'Paytm', logo: '💰', color: '#00BAF2' },
  { name: 'BHIM', logo: '🏦', color: '#FF6B35' },
];

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'Indian Bank'
];

export default function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddUPI, setShowAddUPI] = useState(false);
  const [showBankList, setShowBankList] = useState(false);
  const [orderTotal] = useState(781); // Example order total

  // Card form state
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  // UPI form state
  const [upiForm, setUpiForm] = useState({
    upiId: '',
    provider: '',
  });

  const [selectedBank, setSelectedBank] = useState('');

  const handlePayment = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    Alert.alert(
      'Payment Confirmation',
      `Proceed with payment of ₹${orderTotal} using ${getPaymentMethodName(selectedMethod)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            Alert.alert('Success', 'Payment processed successfully!');
          }
        }
      ]
    );
  };

  const getPaymentMethodName = (methodId: string) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method?.title || methodId;
  };

  const renderPaymentMethod = (method: typeof PAYMENT_METHODS[0]) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedMethod(method.id)}
    >
      <View style={styles.paymentMethodLeft}>
        <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
          <method.icon size={24} color={method.color} />
        </View>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentTitleRow}>
            <Text style={styles.paymentTitle}>{method.title}</Text>
            {method.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>
          <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
        </View>
      </View>
      <View style={styles.radioButton}>
        {selectedMethod === method.id && (
          <View style={styles.radioSelected}>
            <Check size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSavedCard = (card: typeof SAVED_CARDS[0]) => (
    <TouchableOpacity
      key={card.id}
      style={[
        styles.savedPaymentCard,
        selectedMethod === `card_${card.id}` && styles.selectedSavedPayment
      ]}
      onPress={() => setSelectedMethod(`card_${card.id}`)}
    >
      <View style={styles.savedPaymentLeft}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardType}>
            {card.type === 'visa' ? '💳' : '💳'}
          </Text>
        </View>
        <View>
          <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
          <Text style={styles.cardDetails}>{card.name} • {card.expiry}</Text>
        </View>
      </View>
      {card.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSavedUPI = (upi: typeof SAVED_UPI[0]) => (
    <TouchableOpacity
      key={upi.id}
      style={[
        styles.savedPaymentCard,
        selectedMethod === `upi_${upi.id}` && styles.selectedSavedPayment
      ]}
      onPress={() => setSelectedMethod(`upi_${upi.id}`)}
    >
      <View style={styles.savedPaymentLeft}>
        <View style={styles.upiIcon}>
          <Text style={styles.upiEmoji}>📱</Text>
        </View>
        <View>
          <Text style={styles.upiId}>{upi.upiId}</Text>
          <Text style={styles.upiProvider}>{upi.provider}</Text>
        </View>
      </View>
      {upi.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const AddCardModal = () => (
    <Modal visible={showAddCard} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Credit/Debit Card</Text>
          <TouchableOpacity onPress={() => setShowAddCard(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.securityNote}>
            <Shield size={16} color="#4CAF50" />
            <Text style={styles.securityText}>Your card details are encrypted and secure</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput
              style={styles.formInput}
              value={cardForm.number}
              onChangeText={(text) => setCardForm({...cardForm, number: text})}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>Expiry Date</Text>
              <TextInput
                style={styles.formInput}
                value={cardForm.expiry}
                onChangeText={(text) => setCardForm({...cardForm, expiry: text})}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.formLabel}>CVV</Text>
              <TextInput
                style={styles.formInput}
                value={cardForm.cvv}
                onChangeText={(text) => setCardForm({...cardForm, cvv: text})}
                placeholder="123"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.formInput}
              value={cardForm.name}
              onChangeText={(text) => setCardForm({...cardForm, name: text})}
              placeholder="JOHN DOE"
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Card</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const AddUPIModal = () => (
    <Modal visible={showAddUPI} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add UPI ID</Text>
          <TouchableOpacity onPress={() => setShowAddUPI(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>UPI ID</Text>
            <TextInput
              style={styles.formInput}
              value={upiForm.upiId}
              onChangeText={(text) => setUpiForm({...upiForm, upiId: text})}
              placeholder="yourname@paytm"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionTitle}>Popular UPI Apps</Text>
          <View style={styles.upiAppsGrid}>
            {UPI_APPS.map((app, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.upiAppCard,
                  upiForm.provider === app.name && styles.selectedUpiApp
                ]}
                onPress={() => setUpiForm({...upiForm, provider: app.name})}
              >
                <Text style={styles.upiAppLogo}>{app.logo}</Text>
                <Text style={styles.upiAppName}>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add UPI ID</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const BankListModal = () => (
    <Modal visible={showBankList} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Your Bank</Text>
          <TouchableOpacity onPress={() => setShowBankList(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {BANKS.map((bank, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.bankItem,
                selectedBank === bank && styles.selectedBank
              ]}
              onPress={() => {
                setSelectedBank(bank);
                setSelectedMethod('netbanking');
                setShowBankList(false);
              }}
            >
              <Text style={styles.bankName}>{bank}</Text>
              {selectedBank === bank && (
                <Check size={20} color="#FF6B35" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryAmount}>₹{orderTotal}</Text>
          </View>
          <View style={styles.deliveryTime}>
            <Clock size={16} color="#4CAF50" />
            <Text style={styles.deliveryText}>Estimated delivery: 45-60 mins</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          {PAYMENT_METHODS.map(renderPaymentMethod)}
        </View>

        {/* Saved Cards */}
        {selectedMethod === 'card' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Cards</Text>
              <TouchableOpacity 
                style={styles.addNewButton}
                onPress={() => setShowAddCard(true)}
              >
                <Plus size={16} color="#FF6B35" />
                <Text style={styles.addNewText}>Add New</Text>
              </TouchableOpacity>
            </View>
            {SAVED_CARDS.map(renderSavedCard)}
          </View>
        )}

        {/* Saved UPI */}
        {selectedMethod === 'upi' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved UPI IDs</Text>
              <TouchableOpacity 
                style={styles.addNewButton}
                onPress={() => setShowAddUPI(true)}
              >
                <Plus size={16} color="#FF6B35" />
                <Text style={styles.addNewText}>Add New</Text>
              </TouchableOpacity>
            </View>
            {SAVED_UPI.map(renderSavedUPI)}
          </View>
        )}

        {/* Net Banking */}
        {selectedMethod === 'netbanking' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Bank</Text>
            <TouchableOpacity 
              style={styles.bankSelector}
              onPress={() => setShowBankList(true)}
            >
              <Building2 size={20} color="#2196F3" />
              <Text style={styles.bankSelectorText}>
                {selectedBank || 'Choose your bank'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* COD Info */}
        {selectedMethod === 'cod' && (
          <View style={styles.section}>
            <View style={styles.codInfo}>
              <Banknote size={24} color="#9C27B0" />
              <View style={styles.codDetails}>
                <Text style={styles.codTitle}>Cash on Delivery</Text>
                <Text style={styles.codSubtitle}>
                  Pay ₹{orderTotal} in cash when your order arrives
                </Text>
                <Text style={styles.codNote}>
                  Please keep exact change ready
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Security Note */}
        <View style={styles.securitySection}>
          <Shield size={20} color="#4CAF50" />
          <Text style={styles.securityTitle}>100% Secure Payments</Text>
          <Text style={styles.securityDescription}>
            Your payment information is encrypted and secure. We never store your card details.
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.payButtonContainer}>
        <TouchableOpacity 
          style={[styles.payButton, !selectedMethod && styles.disabledPayButton]}
          onPress={handlePayment}
          disabled={!selectedMethod}
        >
          <Text style={styles.payButtonText}>
            {selectedMethod === 'cod' ? 'Place Order' : `Pay ₹${orderTotal}`}
          </Text>
        </TouchableOpacity>
      </View>

      <AddCardModal />
      <AddUPIModal />
      <BankListModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  orderSummary: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    gap: 4,
  },
  addNewText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedPaymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSavedPayment: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  savedPaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 1,
  },
  cardType: {
    fontSize: 20,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  upiIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 1,
  },
  upiEmoji: {
    fontSize: 20,
  },
  upiId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  upiProvider: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  bankSelectorText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  codInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    gap: 16,
  },
  codDetails: {
    flex: 1,
  },
  codTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  codSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  codNote: {
    fontSize: 12,
    color: '#9C27B0',
    fontStyle: 'italic',
  },
  securitySection: {
    backgroundColor: '#F0F8FF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  payButtonContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  payButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledPayButton: {
    backgroundColor: '#BDC3C7',
    elevation: 0,
    shadowOpacity: 0,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
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
  upiAppsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  upiAppCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedUpiApp: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  upiAppLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  upiAppName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedBank: {
    backgroundColor: '#FFF5F0',
  },
  bankName: {
    fontSize: 16,
    color: '#2C3E50',
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
});