import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Phone, MessageCircle, Mail } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface ContactActionsProps {
  phone?: string;
  email?: string;
  onCall?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
  variant?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium';
}

export const ContactActions: React.FC<ContactActionsProps> = ({
  phone,
  email,
  onCall,
  onMessage,
  onEmail,
  variant = 'horizontal',
  size = 'medium',
}) => {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      Alert.alert('Calling...', `Connecting to ${phone || 'contact'}`);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage();
    } else {
      Alert.alert('Messaging...', 'Opening secure chat');
    }
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail();
    } else {
      Alert.alert('Email...', `Opening email to ${email || 'contact'}`);
    }
  };

  const containerStyle = variant === 'vertical' ? styles.verticalContainer : styles.horizontalContainer;

  return (
    <View style={containerStyle}>
      {phone && (
        <TouchableOpacity 
          style={[styles.actionButton, styles[size], styles.callButton]}
          onPress={handleCall}
        >
          <Phone size={size === 'small' ? 14 : 16} color={COLORS.success} />
          {size === 'medium' && <Text style={styles.callText}>Call</Text>}
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[styles.actionButton, styles[size], styles.messageButton]}
        onPress={handleMessage}
      >
        <MessageCircle size={size === 'small' ? 14 : 16} color={COLORS.info} />
        {size === 'medium' && <Text style={styles.messageText}>Message</Text>}
      </TouchableOpacity>
      
      {email && (
        <TouchableOpacity 
          style={[styles.actionButton, styles[size], styles.emailButton]}
          onPress={handleEmail}
        >
          <Mail size={size === 'small' ? 14 : 16} color={COLORS.text.secondary} />
          {size === 'medium' && <Text style={styles.emailText}>Email</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  verticalContainer: {
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: SPACING.xs,
  },
  
  // Sizes
  small: {
    padding: SPACING.sm,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  
  // Button variants
  callButton: {
    backgroundColor: COLORS.success + '15',
  },
  messageButton: {
    backgroundColor: COLORS.info + '15',
  },
  emailButton: {
    backgroundColor: COLORS.text.secondary + '15',
  },
  
  // Text styles
  callText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    fontWeight: '600',
  },
  emailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});