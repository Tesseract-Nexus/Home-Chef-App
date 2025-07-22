import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, Star, DollarSign, Send } from 'lucide-react-native';

interface TippingModalProps {
  visible: boolean;
  onClose: () => void;
  recipientType: 'chef' | 'delivery';
  recipientName: string;
  recipientImage?: string;
  orderId: string;
  onTipSubmitted: (amount: number, message: string) => void;
}

const QUICK_TIP_AMOUNTS = [20, 30, 50, 100];

export const TippingModal: React.FC<TippingModalProps> = ({
  visible,
  onClose,
  recipientType,
  recipientName,
  orderId,
  onTipSubmitted
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTipSubmit = async () => {
    const tipAmount = selectedAmount || parseInt(customAmount);
    
    if (!tipAmount || tipAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum tip amount is ₹10');
      return;
    }

    if (tipAmount > 500) {
      Alert.alert('Amount Too High', 'Maximum tip amount is ₹500');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onTipSubmitted(tipAmount, tipMessage);
      
      Alert.alert(
        'Tip Sent Successfully! 💝',
        `₹${tipAmount} has been sent directly to ${recipientName}'s bank account. They will be notified about your generous tip!`,
        [{ text: 'Great!', onPress: onClose }]
      );
      
      // Reset form
      setSelectedAmount(null);
      setCustomAmount('');
      setTipMessage('');
    } catch (error) {
      Alert.alert('Payment Failed', 'Unable to process tip. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTipSuggestions = () => {
    return recipientType === 'chef' 
      ? [
          'Amazing food! 😋',
          'Perfectly cooked! 👨‍🍳',
          'Authentic taste! ⭐',
          'Will order again! 💯'
        ]
      : [
          'Super fast delivery! 🚀',
          'Very polite! 😊',
          'On time delivery! ⏰',
          'Great service! 👍'
        ];
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Tip {recipientType === 'chef' ? 'Chef' : 'Delivery Partner'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Recipient Info */}
          <View style={styles.recipientCard}>
            <View style={styles.recipientIcon}>
              {recipientType === 'chef' ? (
                <Text style={styles.recipientEmoji}>👨‍🍳</Text>
              ) : (
                <Text style={styles.recipientEmoji}>🚚</Text>
              )}
            </View>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{recipientName}</Text>
              <Text style={styles.recipientRole}>
                {recipientType === 'chef' ? 'Chef' : 'Delivery Partner'}
              </Text>
              <Text style={styles.orderId}>Order #{orderId}</Text>
            </View>
            <Heart size={24} color="#FF6B35" fill="#FF6B35" />
          </View>

          {/* Quick Tip Amounts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tip Amounts</Text>
            <View style={styles.quickAmountsGrid}>
              {QUICK_TIP_AMOUNTS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    selectedAmount === amount && styles.selectedQuickAmount
                  ]}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  <Text style={[
                    styles.quickAmountText,
                    selectedAmount === amount && styles.selectedQuickAmountText
                  ]}>
                    ₹{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Amount</Text>
            <View style={styles.customAmountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.customAmountInput}
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setSelectedAmount(null);
                }}
                placeholder="Enter amount"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <Text style={styles.amountNote}>Minimum ₹10, Maximum ₹500</Text>
          </View>

          {/* Tip Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add a Message (Optional)</Text>
            <View style={styles.messageSuggestions}>
              {getTipSuggestions().map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => setTipMessage(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.messageInput}
              value={tipMessage}
              onChangeText={setTipMessage}
              placeholder={`Thank ${recipientName} for their excellent service...`}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.characterCount}>{tipMessage.length}/200</Text>
          </View>

          {/* Direct Transfer Info */}
          <View style={styles.directTransferInfo}>
            <DollarSign size={20} color="#4CAF50" />
            <Text style={styles.directTransferText}>
              100% of your tip goes directly to {recipientName}'s bank account. 
              No platform fees deducted.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedAmount && !customAmount) && styles.disabledButton
            ]}
            onPress={handleTipSubmit}
            disabled={(!selectedAmount && !customAmount) || isProcessing}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isProcessing 
                ? 'Processing...' 
                : `Send Tip ₹${selectedAmount || customAmount || '0'}`
              }
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipientIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF5F0',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recipientEmoji: {
    fontSize: 28,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  recipientRole: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedQuickAmount: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectedQuickAmountText: {
    color: '#FF6B35',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    paddingVertical: 16,
  },
  amountNote: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
  messageSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  directTransferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  directTransferText: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});