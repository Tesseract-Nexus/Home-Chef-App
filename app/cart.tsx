import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Minus, Trash2, MapPin, Clock, CreditCard, Tag } from 'lucide-react-native';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { OrderCountdownTimer } from '@/components/OrderCountdownTimer';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { getResponsiveDimensions } from '@/utils/responsive';

export default function CartScreen() {
  const router = useRouter();
  const { 
    cartItems, 
    currentChef, 
    cartTotal, 
    itemCount, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getDeliveryFee,
    getTaxes,
    getFinalTotal,
    getPlatformFee,
    getChefEarnings,
    getOrderBreakdown
  } = useCart();
  const { defaultAddress, addresses } = useAddresses();
  const { placeOrder } = useOrderManagement();
  const [showCountdownTimer, setShowCountdownTimer] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const { isWeb, isDesktop } = getResponsiveDimensions();

  const handleApplyPromo = () => {
    // Simple promo code logic
    const validPromoCodes = {
      'FIRST10': 10, // 10% discount
      'SAVE50': 50,  // ₹50 off
      'WELCOME': 15  // 15% discount
    };

    const discount = validPromoCodes[promoCode.toUpperCase() as keyof typeof validPromoCodes];
    if (discount) {
      const discountAmount = promoCode.toUpperCase() === 'SAVE50' 
        ? Math.min(discount, cartTotal) 
        : Math.round(cartTotal * (discount / 100));
      setPromoDiscount(discountAmount);
      Alert.alert('Promo Applied!', `You saved ₹${discountAmount}`);
    } else {
      Alert.alert('Invalid Promo Code', 'Please enter a valid promo code');
      setPromoDiscount(0);
    }
  };

  const handleProceedToPayment = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }

    if (!defaultAddress) {
      Alert.alert('No Address', 'Please add a delivery address first', [
        { text: 'Add Address', onPress: () => router.push('/addresses' as any) },
        { text: 'Cancel', style: 'cancel' }
      ]);
      return;
    }

    if (cartTotal < (currentChef?.minOrder || 0)) {
      Alert.alert(
        'Minimum Order Not Met', 
        `Minimum order amount is ₹${currentChef?.minOrder}. Add ₹${(currentChef?.minOrder || 0) - cartTotal} more to proceed.`
      );
      return;
    }

    try {
      // Show loading state
      Alert.alert('Processing Payment...', 'Please wait while we process your payment.');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order data
      const orderData = {
        chefId: currentChef?.id,
        chefName: currentChef?.name,
        items: cartItems.map(item => ({
          dishId: item.menuItem.id,
          dishName: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
          specialInstructions: item.specialInstructions,
        })),
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        taxes: taxes,
        total: finalTotal,
        deliveryAddress: {
          fullAddress: defaultAddress?.fullAddress,
          coordinates: defaultAddress?.coordinates || { latitude: 0, longitude: 0 },
        },
        deliveryInstructions,
      };

      // Place the order
      const orderId = await placeOrder(orderData);
      
      // Show countdown timer immediately
      setPlacedOrderId(orderId);
      setShowCountdownTimer(true);
      
      // Clear cart after successful order placement
      clearCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdownTimer(false);
    setPlacedOrderId(null);
    // Navigate to orders page to track the order
    router.push('/(tabs)/orders' as any);
  };

  const handleCountdownCancel = () => {
    setShowCountdownTimer(false);
    setPlacedOrderId(null);
    // Show success message and stay on cart page
    Alert.alert(
      'Order Cancelled Successfully! ✅',
      `Your order has been cancelled and full refund of ₹${finalTotal} will be processed immediately.`,
      [{ text: 'OK' }]
    );
  };

  const renderCartItem = (item: typeof cartItems[0], index: number) => (
    <View key={`${item.menuItem.id}-${index}`} style={styles.cartItem}>
      <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.menuItem.name}</Text>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeFromCart(item.menuItem.id)}
          >
            <Trash2 size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.itemPrice}>₹{item.menuItem.price}</Text>
        
        {item.specialInstructions && (
          <Text style={styles.specialInstructions}>
            Note: {item.specialInstructions}
          </Text>
        )}
        
        <View style={styles.itemFooter}>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
            >
              <Minus size={16} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
            >
              <Plus size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.itemTotal}>₹{item.menuItem.price * item.quantity}</Text>
        </View>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <ResponsiveContainer style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartText}>Add some delicious items to get started!</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/home' as any)}
          >
            <Text style={styles.browseButtonText}>Browse Chefs</Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </ResponsiveContainer>
    );
  }

  const deliveryFee = getDeliveryFee();
  const taxes = getTaxes();
  const finalTotal = getFinalTotal() - promoDiscount;
  const orderBreakdown = getOrderBreakdown();

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart ({itemCount} items)</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearCartText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={[styles.scrollView, isWeb && styles.webScrollView]}
        contentContainerStyle={isWeb ? styles.webContentContainer : undefined}
      >
        {/* Chef Info */}
        {currentChef && (
          <View style={[styles.chefSection, isWeb && styles.webSection]}>
            <Image source={{ uri: currentChef.image }} style={styles.chefImage} />
            <View style={styles.chefInfo}>
              <Text style={styles.chefName}>{currentChef.name}</Text>
              <Text style={styles.chefSpecialty}>{currentChef.specialty}</Text>
              <View style={styles.chefMeta}>
              </View>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={[styles.cartSection, isWeb && styles.webSection]}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {cartItems.map(renderCartItem)}
        </View>

        {/* Delivery Address */}
        <View style={[styles.addressSection, isWeb && styles.webSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/addresses' as any)}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          {defaultAddress ? (
            <View style={styles.addressCard}>
              <MapPin size={16} color="#FF6B35" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
                <Text style={styles.addressText}>{defaultAddress.fullAddress}</Text>
                <Text style={styles.addressCity}>
                  {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/addresses' as any)}
            >
              <Plus size={16} color="#FF6B35" />
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Instructions */}
        <View style={[styles.instructionsSection, isWeb && styles.webSection]}>
          <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          <TextInput
            style={styles.instructionsInput}
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            placeholder="e.g., Ring the bell, Call when you arrive..."
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Promo Code */}
        <View style={[styles.promoSection, isWeb && styles.webSection]}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoInputContainer}>
            <Tag size={16} color="#FF6B35" />
            <TextInput
              style={styles.promoInput}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter promo code"
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoDiscount > 0 && (
            <Text style={styles.promoSuccess}>Promo applied! You saved ₹{promoDiscount}</Text>
          )}
        </View>

        {/* Bill Details */}
        <View style={[styles.billSection, isWeb && styles.webSection]}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{cartTotal}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & Service Fee</Text>
            <Text style={styles.billValue}>₹{taxes}</Text>
          </View>
          
          {promoDiscount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, styles.discountLabel]}>Promo Discount</Text>
              <Text style={[styles.billValue, styles.discountValue]}>-₹{promoDiscount}</Text>
            </View>
          )}
          
          <View style={styles.platformFeeInfo}>
            <Text style={styles.platformFeeTitle}>Platform Fee Breakdown</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Chef Earnings</Text>
              <Text style={styles.billValue}>₹{orderBreakdown.chefEarnings}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Platform Fee (15%)</Text>
              <Text style={styles.billValue}>₹{orderBreakdown.platformFee}</Text>
            </View>
          </View>
          
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{finalTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={[styles.checkoutSection, isWeb && styles.webCheckoutSection]}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutTotal}>₹{finalTotal}</Text>
          <Text style={styles.checkoutText}>Total • {itemCount} items</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            (cartTotal < (currentChef?.minOrder || 0)) && styles.disabledCheckoutButton,
            isWeb && styles.webCheckoutButton
          ]}
          onPress={handleProceedToPayment}
          disabled={cartTotal < (currentChef?.minOrder || 0)}
        >
          <CreditCard size={20} color="#FFFFFF" />
          <Text style={[styles.checkoutButtonText, isWeb && styles.webCheckoutButtonText]}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Countdown Timer Modal */}
      {showCountdownTimer && placedOrderId && (
        <Modal visible={showCountdownTimer} transparent animationType="fade">
          <OrderCountdownTimer
            orderId={placedOrderId}
            orderTotal={finalTotal}
            onCancel={handleCountdownCancel}
            onComplete={handleCountdownComplete}
          />
        </Modal>
      )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webContainer: {
    minHeight: '100vh',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  webScrollView: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  webContentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webHeader: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    borderBottomWidth: 0,
  },
  webSection: {
    marginHorizontal: 0,
    borderRadius: 16,
    marginVertical: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  clearCartText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chefSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  chefImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  chefSpecialty: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 4,
  },
  chefMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  minOrderText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  cartSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
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
  changeText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 4,
  },
  specialInstructions: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  quantityButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    paddingHorizontal: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addressSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  addressInfo: {
    marginLeft: 12,
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
  },
  instructionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  instructionsInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  promoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  promoInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  promoSuccess: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '500',
  },
  billSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  billValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  discountLabel: {
    color: '#4CAF50',
  },
  discountValue: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  platformFeeInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  platformFeeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  checkoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webCheckoutSection: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 20,
    borderRadius: 16,
    borderTopWidth: 0,
    marginBottom: 20,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  checkoutText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  webCheckoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledCheckoutButton: {
    backgroundColor: '#BDC3C7',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webCheckoutButtonText: {
    fontSize: 18,
  },
});