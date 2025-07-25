import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { getResponsiveDimensions } from '@/utils/responsive';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/utils/constants';

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
  const [cancelling, setCancelling] = useState(false);
  const { cancelOrder, confirmOrderAfterTimer } = useOrderManagement();
  const { isWeb, isDesktop } = getResponsiveDimensions();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Defer state updates to avoid render phase updates
          setTimeout(() => {
            confirmOrderAfterTimer(orderId);
            onComplete();
          }, 0);
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
      const success = await cancelOrder(orderId, 'Customer cancelled within free window');
      if (success) {
        onCancel();
      } else {
        Alert.alert('Error', 'Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const confirmCancel = () => {
    if (cancelling) return;
    
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel this order? You can cancel for free within the ${timeLeft}-second window.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        { text: 'Cancel Order', style: 'destructive', onPress: handleCancelOrder }
      ]
    );
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return COLORS.text.primary;
    if (timeLeft > 10) return COLORS.text.secondary;
    return COLORS.text.primary;
  };

  const getProgressPercentage = () => {
    return ((30 - timeLeft) / 30) * 100;
  };

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <View style={[styles.timerCard, isDesktop && styles.desktopTimerCard]}>
        <View style={styles.timerHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Clock size={20} color={COLORS.text.primary} />
            </View>
            <View style={styles.timerInfo}>
              <Text style={[styles.timerTitle, isDesktop && styles.desktopTimerTitle]}>
                Free Cancellation Window
              </Text>
              <Text style={[styles.timerSubtitle, isDesktop && styles.desktopTimerSubtitle]}>
                Cancel within 30 seconds for free
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              // Just close the modal without cancelling
              onComplete();
            }}
            disabled={cancelling}
          >
            <X size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.countdownSection}>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeNumber}>
              {timeLeft}
            </Text>
            <Text style={styles.timeLabel}>seconds left</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: COLORS.text.primary
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.warningSection}>
          <View style={styles.warningIcon}>
            <AlertTriangle size={16} color={COLORS.warning} />
          </View>
          <Text style={styles.warningText}>
            After 30 seconds, cancellation will incur a 40% penalty (₹{Math.round(orderTotal * 0.4)})
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.cancelOrderButton, cancelling && styles.disabledButton]}
          onPress={confirmCancel}
          disabled={cancelling}
        >
          <Text style={styles.cancelOrderButtonText}>
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.keepOrderButton}
          onPress={() => onComplete()}
          disabled={cancelling}
        >
          <Text style={styles.keepOrderButtonText}>Keep Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    padding: SPACING.xl * 2,
  },
  timerCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    elevation: 10,
    shadowColor: '#000',
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: 400,
  },
  desktopTimerCard: {
    padding: SPACING.xl * 1.5,
    maxWidth: 500,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  timerInfo: {
    flex: 1,
  },
  timerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  desktopTimerTitle: {
    fontSize: FONT_SIZES.xl,
  },
  timerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  desktopTimerSubtitle: {
    fontSize: FONT_SIZES.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  timeLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  warningIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  cancelOrderButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  disabledButton: {
    backgroundColor: COLORS.text.disabled,
  },
  cancelOrderButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  keepOrderButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  keepOrderButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});