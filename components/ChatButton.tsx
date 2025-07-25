import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { ChatOpsModal } from '@/components/ChatOpsModal';
import { useChatOps } from '@/hooks/useChatOps';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface ChatButtonProps {
  orderId: string;
  chatType: 'customer-delivery' | 'chef-delivery';
  title?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  orderId,
  chatType,
  title,
  size = 'medium',
  variant = 'primary',
  disabled = false,
}) => {
  const { user } = useAuth();
  const { getChatSessionByOrder, getUnreadCount, isMessageAllowed } = useChatOps();
  const [showChatModal, setShowChatModal] = useState(false);

  // Check if user is allowed to use this chat type
  const canUseChat = user ? isMessageAllowed(user.role as string, chatType) : false;

  // Get existing chat session to show unread count
  const existingSession = getChatSessionByOrder(orderId, chatType);
  const unreadCount = existingSession ? getUnreadCount(existingSession.id) : 0;

  const handlePress = () => {
    if (!canUseChat) {
      return;
    }
    setShowChatModal(true);
  };

  const getButtonText = () => {
    if (title) return title;
    
    switch (chatType) {
      case 'customer-delivery':
        return user?.role === 'customer' ? 'Chat with Delivery' : 'Chat with Customer';
      case 'chef-delivery':
        return user?.role === 'chef' ? 'Chat with Delivery' : 'Chat with Chef';
      default:
        return 'Chat';
    }
  };

  if (!canUseChat || disabled) {
    return null; // Don't show button if user can't use this chat type
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          styles[variant],
          styles[size],
          disabled && styles.disabled
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <View style={styles.buttonContent}>
          <MessageCircle 
            size={size === 'small' ? 14 : size === 'medium' ? 16 : 18} 
            color={variant === 'outline' ? COLORS.text.primary : COLORS.text.white} 
          />
          <Text style={[
            styles.buttonText,
            styles[`${variant}Text`],
            styles[`${size}Text`]
          ]}>
            {getButtonText()}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <ChatOpsModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        orderId={orderId}
        chatType={chatType}
        title={title}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.text.primary,
  },
  secondary: {
    backgroundColor: COLORS.info,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.primary,
  },
  
  // Sizes
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.text.white,
  },
  secondaryText: {
    color: COLORS.text.white,
  },
  outlineText: {
    color: COLORS.text.primary,
  },
  
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
  
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  unreadText: {
    color: COLORS.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
});