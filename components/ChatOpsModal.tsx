import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Shield, MessageCircle, TriangleAlert as AlertTriangle, Clock, Paperclip, FileText, Download } from 'lucide-react-native';
import { useChatOps, ChatSession, ChatMessage } from '@/hooks/useChatOps';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING, FONT_SIZES } from '@/utils/constants';

interface ChatOpsModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  chatType: 'customer-delivery' | 'chef-delivery';
  title?: string;
}

export const ChatOpsModal: React.FC<ChatOpsModalProps> = ({
  visible,
  onClose,
  orderId,
  chatType,
  title,
}) => {
  const { user } = useAuth();
  const { 
    getChatSessionByOrder, 
    createChatSession, 
    sendMessageWithAttachments, 
    markMessagesAsRead,
    getUnreadCount,
    isMessageAllowed,
    validateFileUpload
  } = useChatOps();
  
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      initializeChat();
    }
  }, [visible, orderId, chatType]);

  useEffect(() => {
    if (currentSession) {
      markMessagesAsRead(currentSession.id);
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentSession?.messages.length]);

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      // Check if chat session already exists
      let session = getChatSessionByOrder(orderId, chatType);
      
      if (!session) {
        // Create new chat session
        const chatId = await createChatSession(orderId, chatType);
        session = getChatSessionByOrder(orderId, chatType);
      }
      
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      Alert.alert('Error', 'Failed to start chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentSession || !user) return;

    // Check if user is allowed to send messages
    if (!isMessageAllowed(user.role as string, chatType)) {
      Alert.alert(
        'Communication Restricted',
        'You are not allowed to send messages in this chat type.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendMessageWithAttachments(currentSession.id, newMessage.trim(), selectedFiles);
      
      if (success) {
        setNewMessage('');
        setSelectedFiles([]);
        // Refresh session to get updated messages
        const updatedSession = getChatSessionByOrder(orderId, chatType);
        setCurrentSession(updatedSession);
      } else {
        // Message was blocked or failed
        Alert.alert(
          'Message Not Sent',
          'Your message or files contain restricted content. Please keep communication delivery-related only and avoid sharing personal information.'
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileUpload = () => {
    // Simulate file picker for demo
    Alert.alert(
      'Upload File',
      'Select file type to upload:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Image', 
          onPress: () => simulateFileUpload('image') 
        },
        { 
          text: 'Document', 
          onPress: () => simulateFileUpload('document') 
        }
      ]
    );
  };

  const simulateFileUpload = (type: 'image' | 'document') => {
    const mockFile = {
      name: type === 'image' ? 'delivery_photo.jpg' : 'delivery_receipt.pdf',
      type: type === 'image' ? 'image/jpeg' : 'application/pdf',
      size: Math.floor(Math.random() * 1000000) + 100000, // Random size between 100KB-1MB
      url: `mock://file/${Date.now()}`
    };

    const validation = validateFileUpload(mockFile);
    if (!validation.allowed) {
      Alert.alert('Upload Failed', validation.reason);
      return;
    }

    setSelectedFiles(prev => [...prev, mockFile]);
    Alert.alert('File Selected', `${mockFile.name} ready to send`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.senderId === user?.id;
    const isSystemMessage = message.senderId === 'system';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isSystemMessage && styles.systemMessage
        ]}
      >
        {!isOwnMessage && !isSystemMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          isSystemMessage && styles.systemMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            isSystemMessage && styles.systemMessageText
          ]}>
            {message.message}
          </Text>
          
          {/* Render attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {message.attachments.map((attachment, index) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  {attachment.type === 'image' ? (
                    <View style={styles.imageAttachment}>
                      <Image 
                        source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }} 
                        style={styles.attachmentImage} 
                      />
                      <Text style={styles.attachmentName}>{attachment.name}</Text>
                    </View>
                  ) : (
                    <View style={styles.documentAttachment}>
                      <FileText size={24} color="#2196F3" />
                      <View style={styles.documentInfo}>
                        <Text style={styles.attachmentName}>{attachment.name}</Text>
                        <Text style={styles.attachmentSize}>
                          {(attachment.size / 1024).toFixed(1)} KB
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.downloadButton}>
                        <Download size={16} color="#2196F3" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {message.isBlocked && (
          <View style={styles.blockedIndicator}>
            <AlertTriangle size={12} color="#F44336" />
            <Text style={styles.blockedText}>Message blocked: {message.blockedReason}</Text>
          </View>
        )}
      </View>
    );
  };

  const getChatTitle = () => {
    if (title) return title;
    
    switch (chatType) {
      case 'customer-delivery':
        return 'Chat with Delivery Partner';
      case 'chef-delivery':
        return 'Chat with Delivery Partner';
      default:
        return 'Secure Chat';
    }
  };

  const getParticipantInfo = () => {
    if (!currentSession) return '';
    
    const { participants } = currentSession;
    if (chatType === 'customer-delivery') {
      return `${participants.customer?.name || 'Customer'} ↔ ${participants.delivery?.name || 'Delivery Partner'}`;
    } else {
      return `${participants.chef?.name || 'Chef'} ↔ ${participants.delivery?.name || 'Delivery Partner'}`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{getChatTitle()}</Text>
            <Text style={styles.subtitle}>Order #{orderId}</Text>
            <Text style={styles.participants}>{getParticipantInfo()}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            🔒 Secure Chat - Personal info sharing blocked automatically. Only delivery-related communication allowed.
          </Text>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && !currentSession ? (
            <View style={styles.loadingContainer}>
              <Clock size={24} color={COLORS.text.secondary} />
              <Text style={styles.loadingText}>Starting secure chat...</Text>
            </View>
          ) : currentSession ? (
            currentSession.messages.map(renderMessage)
          ) : (
            <View style={styles.emptyContainer}>
              <MessageCircle size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation about your order</Text>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <View style={styles.selectedFilesContainer}>
            <Text style={styles.selectedFilesTitle}>Files to send:</Text>
            {selectedFiles.map((file, index) => (
              <View key={index} style={styles.selectedFileItem}>
                {file.type.startsWith('image/') ? (
                  <Image source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }} style={styles.selectedFileImage} />
                ) : (
                  <FileText size={20} color="#2196F3" />
                )}
                <Text style={styles.selectedFileName}>{file.name}</Text>
                <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeFileButton}>
                  <X size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handleFileUpload}
            disabled={isLoading}
          >
            <Paperclip size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Message about delivery only (no personal info)..."
            multiline
            maxLength={200}
            editable={!isLoading && currentSession?.status === 'active'}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              ((!newMessage.trim() && selectedFiles.length === 0) || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || isLoading}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Chat Guidelines */}
        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Chat Guidelines:</Text>
          <Text style={styles.guidelineItem}>• Keep messages related to order delivery only</Text>
          <Text style={styles.guidelineItem}>• ❌ No phone numbers, emails, addresses, or personal info</Text>
          <Text style={styles.guidelineItem}>• ✅ Upload images/documents for delivery coordination</Text>
          <Text style={styles.guidelineItem}>• Be respectful and professional</Text>
          <Text style={styles.guidelineItem}>• 🛡️ All messages are monitored for security</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  participants: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  securityText: {
    fontSize: FONT_SIZES.sm,
    color: '#4CAF50',
    flex: 1,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messagesContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: SPACING.lg,
    maxWidth: '85%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  systemMessage: {
    alignSelf: 'center',
    maxWidth: '90%',
  },
  senderName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.text.primary,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  systemMessageBubble: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  ownMessageText: {
    color: COLORS.text.white,
  },
  otherMessageText: {
    color: COLORS.text.primary,
  },
  systemMessageText: {
    color: '#F57C00',
    textAlign: 'center',
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.text.tertiary,
  },
  blockedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  blockedText: {
    fontSize: FONT_SIZES.xs,
    color: '#F44336',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.md,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.secondary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.text.primary,
    padding: SPACING.md,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  attachButton: {
    padding: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    marginRight: SPACING.sm,
  },
  selectedFilesContainer: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  selectedFilesTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  selectedFileImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  selectedFileName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  removeFileButton: {
    padding: SPACING.xs,
  },
  attachmentsContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  attachmentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  imageAttachment: {
    alignItems: 'center',
  },
  attachmentImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  documentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.white,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  downloadButton: {
    padding: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  guidelines: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  guidelinesTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: SPACING.sm,
  },
  guidelineItem: {
    fontSize: FONT_SIZES.xs,
    color: '#2196F3',
    marginBottom: 2,
  },
});