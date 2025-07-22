import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Modal } from 'react-native';
import { Phone, MessageCircle, MapPin, Clock, Star, Send, X, User, Shield } from 'lucide-react-native';
import { TippingModal } from '@/components/TippingModal';

interface DeliveryPerson {
  name: string;
  phone: string;
  rating: number;
  image: string;
  vehicleNumber: string;
  estimatedArrival: string;
  currentLocation: string;
}

interface Order {
  id: string;
  chefName: string;
  deliveryPerson: DeliveryPerson;
  trackingSteps: Array<{
    step: string;
    completed: boolean;
    time: string;
  }>;
}

interface DeliveryTrackerProps {
  order: Order;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'delivery';
  message: string;
  timestamp: Date;
  blocked?: boolean;
}

const SAMPLE_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'delivery',
    message: 'Hi! I have picked up your order from the chef. On my way to your location.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: '2',
    sender: 'customer',
    message: 'Great! How long will it take to reach?',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: '3',
    sender: 'delivery',
    message: 'I will reach in about 10-15 minutes. Please be available to receive the order.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
];

const BLOCKED_WORDS = [
  'phone', 'number', 'call', 'mobile', 'contact', 'whatsapp', 'telegram',
  '9', '8', '7', '6', '+91', 'personal', 'direct', 'outside'
];

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ order, onClose }) => {
  const [currentStep, setCurrentStep] = useState(2); // Simulating "Preparing" step
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SAMPLE_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [showTippingModal, setShowTippingModal] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < order.trackingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 30000); // Update every 30 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const handleCall = (type: 'chef' | 'delivery') => {
    setIsCallModalVisible(true);
    // Simulate secure calling without revealing actual numbers
    setTimeout(() => {
      setIsCallModalVisible(false);
      Alert.alert(
        'Call Connected',
        `You are now connected to the ${type === 'chef' ? 'chef' : 'delivery person'} through our secure calling system.`,
        [{ text: 'End Call', style: 'destructive' }]
      );
    }, 2000);
  };

  const handleTipSubmitted = (amount: number, message: string) => {
    console.log(`Tip of ₹${amount} sent to ${order.deliveryPerson.name} with message: ${message}`);
    setShowTippingModal(false);
  };

  const checkMessageForBlockedContent = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return BLOCKED_WORDS.some(word => lowerMessage.includes(word));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (checkMessageForBlockedContent(newMessage)) {
      Alert.alert(
        'Message Blocked',
        'Your message contains personal information that cannot be shared. Please keep communication related to the delivery only.',
        [{ text: 'OK' }]
      );
      return;
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'customer',
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate delivery person response
    setTimeout(() => {
      const responses = [
        'Thank you for the update!',
        'I will be there shortly.',
        'Please wait, I am on my way.',
        'Almost there!',
      ];
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'delivery',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, response]);
    }, 2000);
  };

  const renderTrackingStep = (step: typeof order.trackingSteps[0], index: number) => {
    const isCompleted = index <= currentStep;
    const isCurrent = index === currentStep;

    return (
      <View key={index} style={styles.trackingStep}>
        <View style={styles.stepIndicator}>
          <View style={[
            styles.stepDot,
            isCompleted && styles.completedDot,
            isCurrent && styles.currentDot
          ]}>
            {isCompleted && <View style={styles.innerDot} />}
          </View>
          {index < order.trackingSteps.length - 1 && (
            <View style={[styles.stepLine, isCompleted && styles.completedLine]} />
          )}
        </View>
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, isCompleted && styles.completedStepTitle]}>
            {step.step}
          </Text>
          {step.time && (
            <Text style={styles.stepTime}>{step.time}</Text>
          )}
          {isCurrent && (
            <Text style={styles.currentStepIndicator}>In Progress...</Text>
          )}
        </View>
      </View>
    );
  };

  const renderChatMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.chatMessage,
        message.sender === 'customer' ? styles.customerMessage : styles.deliveryMessage
      ]}
    >
      <Text style={[
        styles.messageText,
        message.sender === 'customer' ? styles.customerMessageText : styles.deliveryMessageText
      ]}>
        {message.message}
      </Text>
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const CallModal = () => (
    <Modal visible={isCallModalVisible} transparent animationType="fade">
      <View style={styles.callModalOverlay}>
        <View style={styles.callModal}>
          <View style={styles.callIcon}>
            <Phone size={32} color="#4CAF50" />
          </View>
          <Text style={styles.callText}>Connecting securely...</Text>
          <Text style={styles.callSubtext}>Your number will remain private</Text>
        </View>
      </View>
    </Modal>
  );

  const ChatModal = () => (
    <Modal visible={showChat} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderInfo}>
            <Image source={{ uri: order.deliveryPerson.image }} style={styles.chatAvatar} />
            <View>
              <Text style={styles.chatHeaderName}>{order.deliveryPerson.name}</Text>
              <Text style={styles.chatHeaderStatus}>Delivery Partner</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowChat(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNotice}>
          <Shield size={16} color="#4CAF50" />
          <Text style={styles.privacyText}>
            Personal information sharing is not allowed. Keep communication delivery-related only.
          </Text>
        </View>

        <ScrollView style={styles.chatMessages}>
          {chatMessages.map(renderChatMessage)}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            multiline
            maxLength={200}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Delivery Person Info */}
      <View style={styles.deliveryPersonCard}>
        <Image source={{ uri: order.deliveryPerson.image }} style={styles.deliveryPersonImage} />
        <View style={styles.deliveryPersonInfo}>
          <Text style={styles.deliveryPersonName}>{order.deliveryPerson.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{order.deliveryPerson.rating}</Text>
          </View>
          <Text style={styles.vehicleNumber}>Vehicle: {order.deliveryPerson.vehicleNumber}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCall('delivery')}
          >
            <Phone size={16} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => setShowChat(true)}
          >
            <MessageCircle size={16} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tipButton}
            onPress={() => setShowTippingModal(true)}
          >
            <Text style={styles.tipButtonText}>💝</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MapPin size={20} color="#FF6B35" />
          <Text style={styles.statusTitle}>Current Status</Text>
        </View>
        <Text style={styles.currentLocation}>{order.deliveryPerson.currentLocation}</Text>
        <View style={styles.estimatedTime}>
          <Clock size={16} color="#4CAF50" />
          <Text style={styles.estimatedTimeText}>
            Estimated arrival: {order.deliveryPerson.estimatedArrival}
          </Text>
        </View>
      </View>

      {/* Order Tracking */}
      <View style={styles.trackingCard}>
        <Text style={styles.trackingTitle}>Order Progress</Text>
        {order.trackingSteps.map(renderTrackingStep)}
      </View>

      {/* Chef Contact */}
      <View style={styles.chefContactCard}>
        <Text style={styles.chefContactTitle}>Need to contact the chef?</Text>
        <TouchableOpacity 
          style={styles.chefCallButton}
          onPress={() => handleCall('chef')}
        >
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.chefCallText}>Call {order.chefName}</Text>
        </TouchableOpacity>
      </View>

      <ChatModal />
      <CallModal />
      
      <TippingModal
        visible={showTippingModal}
        onClose={() => setShowTippingModal(false)}
        recipientType="delivery"
        recipientName={order.deliveryPerson.name}
        orderId={order.id}
        onTipSubmitted={handleTipSubmitted}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  deliveryPersonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryPersonImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  deliveryPersonInfo: {
    flex: 1,
  },
  deliveryPersonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  vehicleNumber: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 25,
  },
  chatButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 25,
  },
  tipButton: {
    backgroundColor: '#FFF0F5',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtonText: {
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  currentLocation: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 12,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
  },
  estimatedTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  currentDot: {
    backgroundColor: '#FF6B35',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginTop: 5,
  },
  completedLine: {
    backgroundColor: '#4CAF50',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  completedStepTitle: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  stepTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  currentStepIndicator: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 2,
  },
  chefContactCard: {
    backgroundColor: '#FFF5F0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5D6',
  },
  chefContactTitle: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  chefCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  chefCallText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatMessage: {
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  customerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B35',
  },
  deliveryMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  customerMessageText: {
    color: '#FFFFFF',
  },
  deliveryMessageText: {
    color: '#2C3E50',
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.7,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 20,
  },
  callModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 200,
  },
  callIcon: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 40,
    marginBottom: 15,
  },
  callText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  callSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});