import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { getResponsiveDimensions } from '@/utils/responsive';

interface OrderCountdownTimerProps {
  orderId: string;
  orderTotal: number;
  onCancel: () => void;
  onComplete: () => void;
}

export const OrderCountdownTimer: React.FC<OrderCountdownTimerProps> = ({
  orderId,
  orderTotal,
  onCancel,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { cancelOrder, confirmOrderAfterTimer } = useOrderManagement();
  const { isWeb, isDesktop } = getResponsiveDimensions();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Confirm order and send to chef
          confirmOrderAfterTimer(orderId);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete, orderId, confirmOrderAfterTimer]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await cancelOrder(orderId, 'Customer cancelled within free window');
      onCancel();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancelling(false);
    }
  };

  const confirmCancel = () => {
    handleCancelOrder();
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return '#4CAF50';
    if (timeLeft > 10) return '#FF9800';
    return '#F44336';
  };

  const getProgressPercentage = () => {
    return ((30 - timeLeft) / 30) * 100;
  };

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <View style={[styles.timerCard, isDesktop && styles.desktopTimerCard]}>
        <View style={styles.timerHeader}>
          <View style={styles.timerIconContainer}>
            <Clock size={24} color={getTimerColor()} />
          </View>
          <View style={styles.timerInfo}>
            <Text style={[styles.timerTitle, isDesktop && styles.desktopTimerTitle]}>
              Free Cancellation Window
            </Text>
            <Text style={[styles.timerSubtitle, isDesktop && styles.desktopTimerSubtitle]}>
              Cancel within 30 seconds for free
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: getTimerColor() }]}
            onPress={confirmCancel}
            disabled={cancelling}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.countdownSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getTimerColor()
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.timeDisplay}>
            <Text style={[styles.timeNumber, { color: getTimerColor() }]}>
              {timeLeft}
            </Text>
            <Text style={styles.timeLabel}>seconds left</Text>
          </View>
        </View>

        <View style={styles.warningSection}>
          <AlertTriangle size={16} color="#FF9800" />
          <Text style={styles.warningText}>
            After 30 seconds, cancellation will incur a 40% penalty (₹{Math.round(orderTotal * 0.4)})
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    padding: 40,
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: '100%',
    maxWidth: 400,
  },
  desktopTimerCard: {
    padding: 30,
    maxWidth: 500,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timerInfo: {
    flex: 1,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  desktopTimerTitle: {
    fontSize: 18,
  },
  timerSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  desktopTimerSubtitle: {
    fontSize: 14,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSection: {
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#F57C00',
    flex: 1,
    lineHeight: 16,
  },
});