import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'chef' | 'delivery';
  message: string;
  timestamp: Date;
  isRead: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  attachments?: {
    id: string;
    name: string;
    type: 'image' | 'document';
    url: string;
    size: number;
  }[];
}

export interface ChatSession {
  id: string;
  orderId: string;
  participants: {
    customer?: { id: string; name: string; image?: string };
    chef?: { id: string; name: string; image?: string };
    delivery?: { id: string; name: string; image?: string };
  };
  allowedCommunication: 'customer-delivery' | 'chef-delivery';
  status: 'active' | 'ended';
  createdAt: Date;
  lastMessageAt?: Date;
  messages: ChatMessage[];
}

interface ChatOpsContextType {
  chatSessions: ChatSession[];
  activeChatSession: ChatSession | null;
  sendMessage: (chatId: string, message: string) => Promise<boolean>;
  sendMessageWithAttachments: (chatId: string, message: string, attachments?: any[]) => Promise<boolean>;
  createChatSession: (orderId: string, type: 'customer-delivery' | 'chef-delivery') => Promise<string>;
  endChatSession: (chatId: string) => Promise<void>;
  getChatSession: (chatId: string) => ChatSession | null;
  getChatSessionByOrder: (orderId: string, type: 'customer-delivery' | 'chef-delivery') => ChatSession | null;
  markMessagesAsRead: (chatId: string) => void;
  getUnreadCount: (chatId: string) => number;
  isMessageAllowed: (senderType: string, chatType: string) => boolean;
  validateFileUpload: (file: any) => { allowed: boolean; reason?: string };
}

// Blocked words and phrases to prevent direct contact sharing
const BLOCKED_CONTENT = [
  // Contact information
  'phone', 'number', 'call', 'mobile', 'contact', 'whatsapp', 'telegram', 'instagram', 'facebook',
  'twitter', 'snapchat', 'linkedin', 'skype', 'viber', 'signal', 'discord', 'zoom', 'meet',
  '+91', '+1', '+44', '+86', '+81', '+49', '+33', '+39', '+7', '+55', '+52', '+34', '+31', '+41',
  '9', '8', '7', '6', '5', '4', '3', '2', '1', '0', 'personal', 'direct', 'outside', 'privately', 'offline',
  // Address sharing
  'address', 'location', 'meet', 'pickup', 'home', 'office', 'building', 'apartment', 'flat',
  'house', 'street', 'road', 'lane', 'avenue', 'colony', 'society', 'tower', 'floor', 'room',
  'pincode', 'zipcode', 'postal', 'landmark', 'near', 'opposite', 'behind', 'front', 'beside',
  // Payment bypass
  'cash', 'money', 'payment', 'pay', 'upi', 'paytm', 'gpay', 'phonepe', 'bank', 'account',
  'transfer', 'neft', 'rtgs', 'imps', 'wallet', 'card', 'credit', 'debit', 'netbanking',
  'bhim', 'amazon pay', 'freecharge', 'mobikwik', 'paypal', 'razorpay', 'stripe',
  // Platform bypass
  'app', 'platform', 'website', 'bypass', 'avoid', 'commission', 'fee', 'direct order',
  'without app', 'offline order', 'personal order', 'private deal', 'side business',
  // Personal information
  'email', 'gmail', 'yahoo', 'hotmail', 'outlook', '@', '.com', '.in', '.org', '.net',
  'name is', 'my name', 'i am', 'call me', 'real name', 'full name', 'surname', 'lastname',
  'age', 'birthday', 'born', 'family', 'wife', 'husband', 'son', 'daughter', 'father', 'mother',
  'work at', 'job', 'company', 'office', 'business', 'profession', 'occupation'
];

const ChatOpsContext = createContext<ChatOpsContextType | undefined>(undefined);

export const useChatOps = () => {
  const context = useContext(ChatOpsContext);
  if (context === undefined) {
    throw new Error('useChatOps must be used within a ChatOpsProvider');
  }
  return context;
};

interface ChatOpsProviderProps {
  children: ReactNode;
}

export const ChatOpsProvider: React.FC<ChatOpsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);

  const isMessageAllowed = (senderType: string, chatType: string): boolean => {
    // Only allow specific communication patterns
    if (chatType === 'customer-delivery') {
      return senderType === 'customer' || senderType === 'delivery';
    }
    if (chatType === 'chef-delivery') {
      return senderType === 'chef' || senderType === 'delivery';
    }
    return false;
  };

  const containsBlockedContent = (message: string): { blocked: boolean; reason?: string } => {
    const lowerMessage = message.toLowerCase();
    
    // Check for phone numbers (multiple international formats)
    const phoneRegex = /(\+\d{1,4}[\s-]?)?\d{6,15}|\b[6-9]\d{9}\b|\b\d{3}[\s-]\d{3}[\s-]\d{4}\b/;
    if (phoneRegex.test(message)) {
      return { blocked: true, reason: 'Phone number sharing is not allowed' };
    }

    // Check for blocked words
    for (const word of BLOCKED_CONTENT) {
      if (lowerMessage.includes(word.toLowerCase())) {
        return { blocked: true, reason: 'Personal information sharing is not allowed' };
      }
    }

    // Check for email patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b|\b[A-Za-z0-9._%+-]+\s*at\s*[A-Za-z0-9.-]+\s*dot\s*[A-Z|a-z]{2,}\b/;
    if (emailRegex.test(message)) {
      return { blocked: true, reason: 'Email sharing is not allowed' };
    }

    // Check for address patterns
    const addressRegex = /\b\d+[\s,]*[A-Za-z\s]+(?:street|road|lane|avenue|colony|society|tower|building|apartment|flat|house)\b/i;
    if (addressRegex.test(message)) {
      return { blocked: true, reason: 'Address sharing is not allowed' };
    }

    // Check for pincode patterns
    const pincodeRegex = /\b\d{6}\b|\bpin[\s:]*\d{6}\b|\bpincode[\s:]*\d{6}\b/i;
    if (pincodeRegex.test(message)) {
      return { blocked: true, reason: 'Pincode sharing is not allowed' };
    }

    // Check for social media handles
    const socialMediaRegex = /@[A-Za-z0-9._]+|instagram\.com|facebook\.com|twitter\.com|linkedin\.com/i;
    if (socialMediaRegex.test(message)) {
      return { blocked: true, reason: 'Social media links are not allowed' };
    }

    // Check for attempts to share personal names
    const namePatterns = /my name is|i am|call me|real name|full name/i;
    if (namePatterns.test(message)) {
      return { blocked: true, reason: 'Personal name sharing is not allowed' };
    }
    return { blocked: false };
  };

  const createChatSession = async (orderId: string, type: 'customer-delivery' | 'chef-delivery'): Promise<string> => {
    const chatId = `chat_${orderId}_${type}_${Date.now()}`;
    
    const newSession: ChatSession = {
      id: chatId,
      orderId,
      participants: {
        // These would be populated based on the actual order data
        customer: type === 'customer-delivery' ? { id: user?.id || '', name: user?.name || '' } : undefined,
        chef: type === 'chef-delivery' ? { id: user?.id || '', name: user?.name || '' } : undefined,
        delivery: { id: 'delivery_1', name: 'Delivery Partner' }, // This would come from order data
      },
      allowedCommunication: type,
      status: 'active',
      createdAt: new Date(),
      messages: [],
    };

    setChatSessions(prev => [...prev, newSession]);
    setActiveChatSession(newSession);

    // Send welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'HomeChef Support',
      senderType: 'delivery', // System messages appear as delivery for simplicity
      message: `Welcome to secure chat! Please keep communication related to your order delivery only. Personal information sharing is not allowed.`,
      timestamp: new Date(),
      isRead: false,
    };

    setChatSessions(prev => prev.map(session => 
      session.id === chatId 
        ? { ...session, messages: [welcomeMessage], lastMessageAt: new Date() }
        : session
    ));

    return chatId;
  };

  const sendMessage = async (chatId: string, message: string): Promise<boolean> => {
    return sendMessageWithAttachments(chatId, message, []);
  };

  const sendMessageWithAttachments = async (chatId: string, message: string, attachments: any[] = []): Promise<boolean> => {
    if (!user) return false;

    const session = chatSessions.find(s => s.id === chatId);
    if (!session || session.status !== 'active') return false;

    // Check if user is allowed to send messages in this chat
    if (!isMessageAllowed(user.role as string, session.allowedCommunication)) {
      return false;
    }

    // Check for blocked content
    const contentCheck = containsBlockedContent(message);
    if (contentCheck.blocked) {
      // Add notification about blocked message
      addNotification({
        type: 'system',
        title: 'Message Blocked',
        message: contentCheck.reason || 'Your message contains restricted content',
        isRead: false,
      });
      return false;
    }

    // Validate attachments
    for (const attachment of attachments) {
      const validation = validateFileUpload(attachment);
      if (!validation.allowed) {
        addNotification({
          type: 'system',
          title: 'File Upload Blocked',
          message: validation.reason || 'File type not allowed',
          isRead: false,
        });
        return false;
      }
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: user.id,
      senderName: user.name,
      senderType: user.role as 'customer' | 'chef' | 'delivery',
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
      attachments: attachments.map(att => ({
        id: `att_${Date.now()}_${Math.random()}`,
        name: att.name,
        type: att.type,
        url: att.url || `mock://attachment/${att.name}`,
        size: att.size || 0,
      })),
    };

    setChatSessions(prev => prev.map(session => 
      session.id === chatId 
        ? { 
            ...session, 
            messages: [...session.messages, newMessage],
            lastMessageAt: new Date()
          }
        : session
    ));

    // Notify other participants
    const otherParticipants = Object.values(session.participants).filter(p => p && p.id !== user.id);
    otherParticipants.forEach(participant => {
      if (participant) {
        addNotification({
          type: 'system',
          title: 'New Message',
          message: `${user.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          isRead: false,
        });
      }
    });

    // Simulate delivery partner response for demo
    if (user.role !== 'delivery') {
      setTimeout(() => {
        const responses = [
          "I'm on my way to your location.",
          "Thank you for the update!",
          "I'll be there in 10 minutes.",
          "Please be available to receive the order.",
          "I'm at the pickup location now.",
        ];
        
        const autoResponse: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          chatId,
          senderId: 'delivery_1',
          senderName: 'Delivery Partner',
          senderType: 'delivery',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          isRead: false,
        };

        setChatSessions(prev => prev.map(session => 
          session.id === chatId 
            ? { 
                ...session, 
                messages: [...session.messages, autoResponse],
                lastMessageAt: new Date()
              }
            : session
        ));
      }, 2000);
    }

    return true;
  };

  const endChatSession = async (chatId: string): Promise<void> => {
    setChatSessions(prev => prev.map(session => 
      session.id === chatId 
        ? { ...session, status: 'ended' }
        : session
    ));

    if (activeChatSession?.id === chatId) {
      setActiveChatSession(null);
    }
  };

  const getChatSession = (chatId: string): ChatSession | null => {
    return chatSessions.find(session => session.id === chatId) || null;
  };

  const getChatSessionByOrder = (orderId: string, type: 'customer-delivery' | 'chef-delivery'): ChatSession | null => {
    return chatSessions.find(session => 
      session.orderId === orderId && session.allowedCommunication === type
    ) || null;
  };

  const markMessagesAsRead = (chatId: string): void => {
    setChatSessions(prev => prev.map(session => 
      session.id === chatId 
        ? { 
            ...session, 
            messages: session.messages.map(msg => ({ ...msg, isRead: true }))
          }
        : session
    ));
  };

  const getUnreadCount = (chatId: string): number => {
    const session = chatSessions.find(s => s.id === chatId);
    if (!session || !user) return 0;
    
    return session.messages.filter(msg => 
      !msg.isRead && msg.senderId !== user.id
    ).length;
  };

  const validateFileUpload = (file: any): { allowed: boolean; reason?: string } => {
    // Allowed file types for delivery communication
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
      return { 
        allowed: false, 
        reason: 'Only images (JPG, PNG, GIF, WebP) and documents (PDF, TXT, DOC, DOCX) are allowed' 
      };
    }

    if (file.size && file.size > maxFileSize) {
      return { 
        allowed: false, 
        reason: 'File size must be less than 5MB' 
      };
    }

    // Check filename for suspicious content
    const suspiciousPatterns = /contact|phone|number|address|personal|private|info/i;
    if (suspiciousPatterns.test(file.name)) {
      return { 
        allowed: false, 
        reason: 'Filename suggests personal information sharing which is not allowed' 
      };
    }

    return { allowed: true };
  };
  const contextValue: ChatOpsContextType = {
    chatSessions,
    activeChatSession,
    sendMessage,
    sendMessageWithAttachments,
    createChatSession,
    endChatSession,
    getChatSession,
    getChatSessionByOrder,
    markMessagesAsRead,
    getUnreadCount,
    isMessageAllowed,
    validateFileUpload,
  };

  return (
    <ChatOpsContext.Provider value={contextValue}>
      {children}
    </ChatOpsContext.Provider>
  );
};