import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Phone, Mail, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X, Send, User, ChefHat, Truck, Star, Flag, Plus, Filter, Search, Calendar, FileText, Camera, Paperclip, Shield, Zap } from 'lucide-react-native';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerImage: string;
  customerType: 'customer' | 'chef' | 'delivery' | 'staff';
  subject: string;
  description: string;
  category: 'order_issue' | 'payment_issue' | 'delivery_issue' | 'app_issue' | 'account_issue' | 'technical_issue' | 'billing_issue' | 'feature_request' | 'complaint' | 'other';
  subCategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'escalated' | 'resolved' | 'closed';
  assignedTo?: string;
  department: 'general' | 'technical' | 'billing' | 'operations' | 'escalation';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  orderId?: string;
  rating?: number;
  tags: string[];
  escalationLevel: number;
  slaDeadline: Date;
  isOverdue: boolean;
  attachments: string[];
  internalNotes: Array<{
    id: string;
    author: string;
    note: string;
    timestamp: Date;
    isPrivate: boolean;
  }>;
  messages: Array<{
    id: string;
    sender: 'customer' | 'support' | 'system';
    senderName?: string;
    message: string;
    timestamp: Date;
    attachments?: string[];
    isInternal?: boolean;
  }>;
  resolutionTime?: number; // in minutes
  customerSatisfaction?: {
    rating: number;
    feedback: string;
    timestamp: Date;
  };
}

const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'TKT001',
    customerName: 'Raj Patel',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    customerType: 'customer',
    subject: 'Order not delivered - Urgent',
    description: 'My order #ORD125 was supposed to be delivered 2 hours ago but I haven\'t received it yet. The delivery person is not responding to calls.',
    category: 'delivery_issue',
    subCategory: 'delayed_delivery',
    priority: 'urgent',
    status: 'open',
    department: 'operations',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    orderId: 'ORD125',
    tags: ['delayed_delivery', 'unresponsive_driver', 'customer_angry'],
    escalationLevel: 1,
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    isOverdue: false,
    attachments: [],
    internalNotes: [
      {
        id: '1',
        author: 'System',
        note: 'Auto-escalated due to 2-hour delay',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isPrivate: true,
      }
    ],
    messages: [
      {
        id: '1',
        sender: 'customer',
        message: 'My order was supposed to be delivered 2 hours ago. Can you please check the status? The delivery person is not answering calls.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      }
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT002',
    customerName: 'Priya Sharma',
    customerImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    customerType: 'chef',
    subject: 'Weekly payout not received',
    description: 'I haven\'t received my weekly payout for last week. My earnings show ₹12,450 but no payment has been credited to my account.',
    category: 'payment_issue',
    subCategory: 'missing_payout',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Finance Team',
    department: 'billing',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['payout_issue', 'chef_earnings', 'bank_transfer'],
    escalationLevel: 0,
    slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
    isOverdue: false,
    attachments: ['bank_statement.pdf'],
    internalNotes: [
      {
        id: '1',
        author: 'Finance Team',
        note: 'Checking with payment processor. Bank details verified.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isPrivate: true,
      }
    ],
    messages: [
      {
        id: '1',
        sender: 'customer',
        message: 'I haven\'t received my weekly payout. Can you please check my account?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        sender: 'support',
        senderName: 'Finance Team',
        message: 'Hi Priya, I\'m checking your payout status with our payment processor. Will update you within 2 hours.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      }
    ],
  },
  {
    id: '3',
    ticketNumber: 'TKT003',
    customerName: 'Rajesh Kumar',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    customerType: 'delivery',
    subject: 'App crashes during delivery completion',
    description: 'The delivery app keeps crashing when I try to mark orders as delivered. This has happened 5 times today and is affecting my earnings.',
    category: 'technical_issue',
    subCategory: 'app_crash',
    priority: 'critical',
    status: 'escalated',
    assignedTo: 'Tech Support Lead',
    department: 'technical',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
    rating: 5,
    tags: ['app_crash', 'delivery_completion', 'earnings_impact', 'critical_bug'],
    escalationLevel: 2,
    slaDeadline: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isOverdue: true,
    attachments: ['crash_log.txt', 'screenshot.png'],
    internalNotes: [
      {
        id: '1',
        author: 'Tech Support',
        note: 'Bug identified in delivery completion module. Fix deployed in v1.2.3',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isPrivate: true,
      }
    ],
    messages: [
      {
        id: '1',
        sender: 'customer',
        message: 'The app crashes every time I try to complete a delivery. This is seriously affecting my work and earnings.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        sender: 'support',
        senderName: 'Tech Support',
        message: 'We\'ve identified the issue and pushed a fix. Please update your app to version 1.2.3.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: '3',
        sender: 'system',
        message: 'Ticket automatically resolved - App updated successfully',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isInternal: true,
      }
    ],
    resolutionTime: 4320, // 72 hours in minutes
    customerSatisfaction: {
      rating: 5,
      feedback: 'Quick resolution and great communication!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    }
  },
  {
    id: '4',
    ticketNumber: 'TKT004',
    customerName: 'Anita Sharma',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    customerType: 'customer',
    subject: 'Refund request for cancelled order',
    description: 'My order was cancelled by the chef after 1 hour of waiting. I was charged ₹450 but haven\'t received the refund yet.',
    category: 'billing_issue',
    subCategory: 'refund_request',
    priority: 'medium',
    status: 'waiting_customer',
    assignedTo: 'Billing Support',
    department: 'billing',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    orderId: 'ORD126',
    tags: ['refund', 'chef_cancellation', 'payment_issue'],
    escalationLevel: 0,
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
    isOverdue: false,
    attachments: ['payment_screenshot.jpg'],
    internalNotes: [
      {
        id: '1',
        author: 'Billing Support',
        note: 'Refund initiated. Waiting for customer to confirm bank details.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isPrivate: true,
      }
    ],
    messages: [
      {
        id: '1',
        sender: 'customer',
        message: 'My order was cancelled but I haven\'t received the refund. Please help.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: '2',
        sender: 'support',
        senderName: 'Billing Support',
        message: 'Hi Anita, I\'ve initiated your refund. Please confirm your bank account details for processing.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      }
    ],
  },
];

const SUPPORT_CATEGORIES = [
  { id: 'order_issue', label: 'Order Issues', color: '#FF6B35', icon: '🍽️' },
  { id: 'payment_issue', label: 'Payment Issues', color: '#4CAF50', icon: '💳' },
  { id: 'delivery_issue', label: 'Delivery Issues', color: '#2196F3', icon: '🚚' },
  { id: 'app_issue', label: 'App Issues', color: '#9C27B0', icon: '📱' },
  { id: 'account_issue', label: 'Account Issues', color: '#FF9800', icon: '👤' },
  { id: 'technical_issue', label: 'Technical Issues', color: '#F44336', icon: '⚙️' },
  { id: 'billing_issue', label: 'Billing Issues', color: '#00BCD4', icon: '🧾' },
  { id: 'feature_request', label: 'Feature Requests', color: '#8BC34A', icon: '💡' },
  { id: 'complaint', label: 'Complaints', color: '#E91E63', icon: '😠' },
  { id: 'other', label: 'Other', color: '#607D8B', icon: '❓' },
];

const PRIORITY_CONFIG = {
  low: { color: '#4CAF50', label: 'Low', sla: 72 },
  medium: { color: '#FF9800', label: 'Medium', sla: 24 },
  high: { color: '#FF5722', label: 'High', sla: 8 },
  urgent: { color: '#F44336', label: 'Urgent', sla: 4 },
  critical: { color: '#9C27B0', label: 'Critical', sla: 1 },
};

const STATUS_CONFIG = {
  open: { color: '#FF9800', label: 'Open', icon: AlertTriangle },
  in_progress: { color: '#2196F3', label: 'In Progress', icon: Clock },
  waiting_customer: { color: '#FF5722', label: 'Waiting Customer', icon: User },
  escalated: { color: '#9C27B0', label: 'Escalated', icon: Zap },
  resolved: { color: '#4CAF50', label: 'Resolved', icon: CheckCircle },
  closed: { color: '#607D8B', label: 'Closed', icon: CheckCircle },
};

const DEPARTMENTS = [
  { id: 'general', label: 'General Support', color: '#2196F3' },
  { id: 'technical', label: 'Technical Support', color: '#9C27B0' },
  { id: 'billing', label: 'Billing & Finance', color: '#4CAF50' },
  { id: 'operations', label: 'Operations', color: '#FF6B35' },
  { id: 'escalation', label: 'Escalation Team', color: '#F44336' },
];

const SUPPORT_AGENTS = [
  'Rahul Sharma - General Support',
  'Priya Patel - Technical Support',
  'Amit Kumar - Billing Support',
  'Sneha Singh - Operations',
  'Vikram Gupta - Escalation Team',
];

export default function UnifiedSupportManagement() {
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [selectedTab, setSelectedTab] = useState<'open' | 'in_progress' | 'waiting_customer' | 'escalated' | 'resolved' | 'closed'>('open');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [newTicketForm, setNewTicketForm] = useState({
    customerName: '',
    customerType: 'customer' as SupportTicket['customerType'],
    subject: '',
    description: '',
    category: 'other' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
    orderId: '',
  });

  const getFilteredTickets = () => {
    let filtered = tickets.filter(ticket => ticket.status === selectedTab);
    
    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filterCategory);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder = { critical: 5, urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus, 
            updatedAt: new Date(),
            resolvedAt: newStatus === 'resolved' ? new Date() : ticket.resolvedAt
          }
        : ticket
    ));
  };

  const assignTicket = (ticketId: string, agent: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            assignedTo: agent, 
            status: 'in_progress', 
            updatedAt: new Date() 
          }
        : ticket
    ));
  };

  const escalateTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: 'escalated',
            escalationLevel: ticket.escalationLevel + 1,
            department: 'escalation',
            priority: ticket.priority === 'critical' ? 'critical' : 
                     ticket.priority === 'urgent' ? 'critical' :
                     ticket.priority === 'high' ? 'urgent' : 'high',
            updatedAt: new Date()
          }
        : ticket
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message = {
      id: Date.now().toString(),
      sender: 'support' as const,
      senderName: 'Support Agent',
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            messages: [...ticket.messages, message],
            updatedAt: new Date()
          }
        : ticket
    ));

    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message]
    } : null);

    setNewMessage('');
  };

  const addInternalNote = () => {
    if (!internalNote.trim() || !selectedTicket) return;

    const note = {
      id: Date.now().toString(),
      author: 'Support Agent',
      note: internalNote.trim(),
      timestamp: new Date(),
      isPrivate: true,
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            internalNotes: [...ticket.internalNotes, note],
            updatedAt: new Date()
          }
        : ticket
    ));

    setSelectedTicket(prev => prev ? {
      ...prev,
      internalNotes: [...prev.internalNotes, note]
    } : null);

    setInternalNote('');
  };

  const createNewTicket = () => {
    if (!newTicketForm.customerName || !newTicketForm.subject || !newTicketForm.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      ticketNumber: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
      customerName: newTicketForm.customerName,
      customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
      customerType: newTicketForm.customerType,
      subject: newTicketForm.subject,
      description: newTicketForm.description,
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      status: 'open',
      department: 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
      orderId: newTicketForm.orderId || undefined,
      tags: [],
      escalationLevel: 0,
      slaDeadline: new Date(Date.now() + PRIORITY_CONFIG[newTicketForm.priority].sla * 60 * 60 * 1000),
      isOverdue: false,
      attachments: [],
      internalNotes: [],
      messages: [
        {
          id: '1',
          sender: 'customer',
          message: newTicketForm.description,
          timestamp: new Date(),
        }
      ],
    };

    setTickets(prev => [newTicket, ...prev]);
    setShowCreateTicket(false);
    setNewTicketForm({
      customerName: '',
      customerType: 'customer',
      subject: '',
      description: '',
      category: 'other',
      priority: 'medium',
      orderId: '',
    });
    Alert.alert('Success', 'Support ticket created successfully!');
  };

  const getCategoryColor = (category: string) => {
    return SUPPORT_CATEGORIES.find(c => c.id === category)?.color || '#607D8B';
  };

  const getCategoryLabel = (category: string) => {
    return SUPPORT_CATEGORIES.find(c => c.id === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return SUPPORT_CATEGORIES.find(c => c.id === category)?.icon || '❓';
  };

  const getCustomerTypeIcon = (type: SupportTicket['customerType']) => {
    switch (type) {
      case 'chef': return ChefHat;
      case 'delivery': return Truck;
      case 'staff': return Shield;
      default: return User;
    }
  };

  const getSLAStatus = (ticket: SupportTicket) => {
    const now = new Date();
    const timeLeft = ticket.slaDeadline.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    
    if (timeLeft < 0) {
      return { status: 'overdue', text: 'Overdue', color: '#F44336' };
    } else if (hoursLeft < 2) {
      return { status: 'critical', text: `${Math.max(0, hoursLeft)}h left`, color: '#FF5722' };
    } else if (hoursLeft < 8) {
      return { status: 'warning', text: `${hoursLeft}h left`, color: '#FF9800' };
    } else {
      return { status: 'good', text: `${hoursLeft}h left`, color: '#4CAF50' };
    }
  };

  const renderTicketCard = (ticket: SupportTicket) => {
    const StatusIcon = STATUS_CONFIG[ticket.status].icon;
    const CustomerIcon = getCustomerTypeIcon(ticket.customerType);
    const slaStatus = getSLAStatus(ticket);

    return (
      <TouchableOpacity 
        key={ticket.id} 
        style={[
          styles.ticketCard,
          ticket.isOverdue && styles.overdueTicket,
          ticket.priority === 'critical' && styles.criticalTicket
        ]}
        onPress={() => {
          setSelectedTicket(ticket);
          setShowTicketModal(true);
        }}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <View style={styles.ticketNumberRow}>
              <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
              <Text style={styles.categoryIcon}>{getCategoryIcon(ticket.category)}</Text>
            </View>
            <View style={styles.ticketMeta}>
              <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_CONFIG[ticket.priority].color }]}>
                <Text style={styles.priorityText}>{PRIORITY_CONFIG[ticket.priority].label}</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(ticket.category) }]}>
                <Text style={styles.categoryText}>{getCategoryLabel(ticket.category)}</Text>
              </View>
              {ticket.escalationLevel > 0 && (
                <View style={styles.escalationBadge}>
                  <Zap size={10} color="#FFFFFF" />
                  <Text style={styles.escalationText}>L{ticket.escalationLevel}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.ticketStatusSection}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[ticket.status].color }]}>
              <StatusIcon size={12} color="#FFFFFF" />
              <Text style={styles.statusText}>{STATUS_CONFIG[ticket.status].label}</Text>
            </View>
            <View style={[styles.slaBadge, { backgroundColor: slaStatus.color }]}>
              <Clock size={10} color="#FFFFFF" />
              <Text style={styles.slaText}>{slaStatus.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Image source={{ uri: ticket.customerImage }} style={styles.customerImage} />
          <View style={styles.customerInfo}>
            <View style={styles.customerNameRow}>
              <Text style={styles.customerName}>{ticket.customerName}</Text>
              <CustomerIcon size={16} color="#666" />
            </View>
            <Text style={styles.customerType}>{ticket.customerType.charAt(0).toUpperCase() + ticket.customerType.slice(1)}</Text>
            {ticket.assignedTo && (
              <Text style={styles.assignedAgent}>Assigned to: {ticket.assignedTo}</Text>
            )}
          </View>
        </View>

        <Text style={styles.ticketSubject}>{ticket.subject}</Text>
        <Text style={styles.ticketDescription} numberOfLines={2}>{ticket.description}</Text>

        {ticket.orderId && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Related Order: #{ticket.orderId}</Text>
          </View>
        )}

        {ticket.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {ticket.tags.length > 3 && (
              <Text style={styles.moreTags}>+{ticket.tags.length - 3} more</Text>
            )}
          </View>
        )}

        <View style={styles.ticketFooter}>
          <View style={styles.ticketTiming}>
            <Text style={styles.ticketTime}>
              Created: {ticket.createdAt.toLocaleDateString()} at {ticket.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.ticketUpdated}>
              Updated: {ticket.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.ticketStats}>
            <Text style={styles.messageCount}>{ticket.messages.length} messages</Text>
            {ticket.attachments.length > 0 && (
              <Text style={styles.attachmentCount}>{ticket.attachments.length} files</Text>
            )}
          </View>
        </View>

        {ticket.customerSatisfaction && (
          <View style={styles.satisfactionSection}>
            <Text style={styles.satisfactionLabel}>Customer Rating:</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  color={star <= ticket.customerSatisfaction!.rating ? "#FFD700" : "#E0E0E0"}
                  fill={star <= ticket.customerSatisfaction!.rating ? "#FFD700" : "transparent"}
                />
              ))}
            </View>
            <Text style={styles.satisfactionFeedback}>"{ticket.customerSatisfaction.feedback}"</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const TicketModal = () => (
    <Modal visible={showTicketModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Ticket #{selectedTicket?.ticketNumber}
          </Text>
          <View style={styles.modalHeaderActions}>
            <TouchableOpacity 
              style={styles.escalateButton}
              onPress={() => selectedTicket && escalateTicket(selectedTicket.id)}
            >
              <Zap size={16} color="#9C27B0" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTicketModal(false)}>
              <X size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
        </View>

        {selectedTicket && (
          <View style={styles.modalContent}>
            {/* Ticket Details Header */}
            <View style={styles.ticketDetailsHeader}>
              <View style={styles.ticketMetaInfo}>
                <Text style={styles.ticketSubjectLarge}>{selectedTicket.subject}</Text>
                <View style={styles.ticketMetaRow}>
                  <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_CONFIG[selectedTicket.priority].color }]}>
                    <Text style={styles.priorityText}>{PRIORITY_CONFIG[selectedTicket.priority].label}</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedTicket.category) }]}>
                    <Text style={styles.categoryText}>{getCategoryLabel(selectedTicket.category)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[selectedTicket.status].color }]}>
                    <Text style={styles.statusText}>{STATUS_CONFIG[selectedTicket.status].label}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
              >
                <Clock size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
                onPress={() => updateTicketStatus(selectedTicket.id, 'waiting_customer')}
              >
                <User size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Wait Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => updateTicketStatus(selectedTicket.id, 'resolved')}
              >
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Resolve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF6B35' }]}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            </View>

            {/* Assignment */}
            <View style={styles.assignmentSection}>
              <Text style={styles.assignmentTitle}>Assignment & Department</Text>
              <View style={styles.assignmentRow}>
                <Text style={styles.assignmentLabel}>Assigned to:</Text>
                <Text style={styles.assignmentValue}>{selectedTicket.assignedTo || 'Unassigned'}</Text>
              </View>
              <View style={styles.assignmentRow}>
                <Text style={styles.assignmentLabel}>Department:</Text>
                <Text style={styles.assignmentValue}>
                  {DEPARTMENTS.find(d => d.id === selectedTicket.department)?.label || selectedTicket.department}
                </Text>
              </View>
            </View>

            {/* Messages and Internal Notes Tabs */}
            <View style={styles.communicationTabs}>
              <TouchableOpacity style={[styles.commTab, styles.activeCommTab]}>
                <MessageCircle size={16} color="#FF6B35" />
                <Text style={styles.activeCommTabText}>Messages ({selectedTicket.messages.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commTab}>
                <FileText size={16} color="#7F8C8D" />
                <Text style={styles.commTabText}>Internal Notes ({selectedTicket.internalNotes.length})</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView style={styles.messagesContainer}>
              {selectedTicket.messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageCard,
                    message.sender === 'support' ? styles.supportMessage : 
                    message.sender === 'system' ? styles.systemMessage : styles.customerMessage
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageSender}>
                      {message.sender === 'support' ? (message.senderName || 'Support') :
                       message.sender === 'system' ? 'System' : selectedTicket.customerName}
                    </Text>
                    <Text style={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.messageText}>{message.message}</Text>
                  {message.attachments && message.attachments.length > 0 && (
                    <View style={styles.messageAttachments}>
                      {message.attachments.map((attachment, index) => (
                        <View key={index} style={styles.attachmentChip}>
                          <Paperclip size={12} color="#2196F3" />
                          <Text style={styles.attachmentName}>{attachment}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Internal Notes */}
              {selectedTicket.internalNotes.map((note) => (
                <View key={note.id} style={styles.internalNoteCard}>
                  <View style={styles.noteHeader}>
                    <Shield size={14} color="#9C27B0" />
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                    <Text style={styles.noteTime}>
                      {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.noteText}>{note.note}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Input Sections */}
            <View style={styles.inputSections}>
              {/* Customer Message Input */}
              <View style={styles.messageInputContainer}>
                <Text style={styles.inputLabel}>Reply to Customer</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.messageInput}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your response to the customer..."
                    multiline
                    maxLength={1000}
                  />
                  <TouchableOpacity style={styles.attachButton}>
                    <Paperclip size={16} color="#7F8C8D" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Send size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Internal Note Input */}
              <View style={styles.noteInputContainer}>
                <Text style={styles.inputLabel}>Add Internal Note</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.noteInput}
                    value={internalNote}
                    onChangeText={setInternalNote}
                    placeholder="Add internal note for team reference..."
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity style={styles.addNoteButton} onPress={addInternalNote}>
                    <Plus size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  const CreateTicketModal = () => (
    <Modal visible={showCreateTicket} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Support Ticket</Text>
          <TouchableOpacity onPress={() => setShowCreateTicket(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Customer Name *</Text>
            <TextInput
              style={styles.formInput}
              value={newTicketForm.customerName}
              onChangeText={(text) => setNewTicketForm(prev => ({ ...prev, customerName: text }))}
              placeholder="Enter customer name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Customer Type *</Text>
            <View style={styles.customerTypeSelector}>
              {[
                { id: 'customer', label: 'Customer', icon: '👤' },
                { id: 'chef', label: 'Chef', icon: '👨‍🍳' },
                { id: 'delivery', label: 'Delivery Partner', icon: '🚚' },
                { id: 'staff', label: 'Staff Member', icon: '👔' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    newTicketForm.customerType === type.id && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewTicketForm(prev => ({ ...prev, customerType: type.id as SupportTicket['customerType'] }))}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeText,
                    newTicketForm.customerType === type.id && styles.selectedTypeText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subject *</Text>
            <TextInput
              style={styles.formInput}
              value={newTicketForm.subject}
              onChangeText={(text) => setNewTicketForm(prev => ({ ...prev, subject: text }))}
              placeholder="Brief description of the issue"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUPPORT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    newTicketForm.category === category.id && styles.selectedCategoryOption,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setNewTicketForm(prev => ({ ...prev, category: category.id as SupportTicket['category'] }))}
                >
                  <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryOptionText,
                    newTicketForm.category === category.id && { color: category.color }
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Priority *</Text>
            <View style={styles.prioritySelector}>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.priorityOption,
                    newTicketForm.priority === key && styles.selectedPriorityOption,
                    { borderColor: config.color }
                  ]}
                  onPress={() => setNewTicketForm(prev => ({ ...prev, priority: key as SupportTicket['priority'] }))}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    newTicketForm.priority === key && { color: config.color }
                  ]}>
                    {config.label}
                  </Text>
                  <Text style={styles.slaText}>{config.sla}h SLA</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Order ID (Optional)</Text>
            <TextInput
              style={styles.formInput}
              value={newTicketForm.orderId}
              onChangeText={(text) => setNewTicketForm(prev => ({ ...prev, orderId: text }))}
              placeholder="Related order ID if applicable"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={newTicketForm.description}
              onChangeText={(text) => setNewTicketForm(prev => ({ ...prev, description: text }))}
              placeholder="Detailed description of the issue..."
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.createButton} onPress={createNewTicket}>
            <Text style={styles.createButtonText}>Create Support Ticket</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const filteredTickets = getFilteredTickets();
  const overdueTickets = tickets.filter(t => t.isOverdue && t.status !== 'closed').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length;
  const avgRating = tickets.filter(t => t.customerSatisfaction).length > 0 
    ? tickets.filter(t => t.customerSatisfaction).reduce((sum, t) => sum + (t.customerSatisfaction?.rating || 0), 0) / tickets.filter(t => t.customerSatisfaction).length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Unified Support Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.createTicketButton}
            onPress={() => setShowCreateTicket(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerStats}>
            {overdueTickets > 0 && (
              <View style={styles.overdueIndicator}>
                <Text style={styles.overdueText}>{overdueTickets} Overdue</Text>
              </View>
            )}
            {criticalTickets > 0 && (
              <View style={styles.criticalIndicator}>
                <Text style={styles.criticalText}>{criticalTickets} Critical</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tickets, customers, order IDs..."
          />
        </View>
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#FF6B35" />
              <Text style={styles.filterButtonText}>Category</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Calendar size={16} color="#FF6B35" />
              <Text style={styles.filterButtonText}>Date Range</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <User size={16} color="#FF6B35" />
              <Text style={styles.filterButtonText}>Agent</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{tickets.filter(t => t.status === 'open').length}</Text>
          <Text style={styles.summaryLabel}>Open Tickets</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{criticalTickets}</Text>
          <Text style={styles.summaryLabel}>Critical</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{avgRating.toFixed(1)}</Text>
          <Text style={styles.summaryLabel}>Avg Rating</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{overdueTickets}</Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['open', 'in_progress', 'waiting_customer', 'escalated', 'resolved', 'closed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.replace('_', ' ').charAt(0).toUpperCase() + tab.replace('_', ' ').slice(1)} ({tickets.filter(t => t.status === tab).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredTickets.length > 0 ? (
          filteredTickets.map(renderTicketCard)
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={60} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No {selectedTab.replace('_', ' ')} tickets</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedTab === 'open' && 'New support tickets will appear here'}
              {selectedTab === 'in_progress' && 'Tickets being worked on will be shown here'}
              {selectedTab === 'waiting_customer' && 'Tickets waiting for customer response'}
              {selectedTab === 'escalated' && 'Escalated tickets requiring senior attention'}
              {selectedTab === 'resolved' && 'Resolved tickets will be listed here'}
              {selectedTab === 'closed' && 'Closed tickets will appear here'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TicketModal />
      <CreateTicketModal />
    </SafeAreaView>
  );
}

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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createTicketButton: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 20,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  overdueIndicator: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  criticalIndicator: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  criticalText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  filtersRow: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overdueTicket: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  criticalTicket: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  categoryIcon: {
    fontSize: 16,
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  escalationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  escalationText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  ticketStatusSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  slaText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  customerType: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  assignedAgent: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
    marginTop: 2,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  orderInfo: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  tagsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 10,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 12,
  },
  ticketTiming: {
    flex: 1,
  },
  ticketTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  ticketUpdated: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  ticketStats: {
    alignItems: 'flex-end',
  },
  messageCount: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
  },
  attachmentCount: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '500',
  },
  satisfactionSection: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  satisfactionLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  satisfactionFeedback: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 40,
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
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  escalateButton: {
    backgroundColor: '#F3E5F5',
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
  },
  ticketDetailsHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  ticketMetaInfo: {
    gap: 12,
  },
  ticketSubjectLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  ticketMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assignmentSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  assignmentLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  assignmentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  communicationTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeCommTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  commTabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeCommTabText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messageCard: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  customerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  supportMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B35',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
    maxWidth: '70%',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  messageTime: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  messageText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 18,
  },
  messageAttachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  attachmentName: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '500',
  },
  internalNoteCard: {
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#9C27B0',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C27B0',
    flex: 1,
  },
  noteTime: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  noteText: {
    fontSize: 13,
    color: '#2C3E50',
    lineHeight: 18,
  },
  inputSections: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 20,
    gap: 16,
  },
  messageInputContainer: {
    gap: 8,
  },
  noteInputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 60,
    fontSize: 14,
  },
  attachButton: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 20,
  },
  addNoteButton: {
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 20,
  },
  formGroup: {
    marginBottom: 20,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  customerTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  selectedTypeOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  typeIcon: {
    fontSize: 20,
  },
  typeText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  categoryOption: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
    minWidth: 100,
  },
  selectedCategoryOption: {
    backgroundColor: '#FFF5F0',
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
  },
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: '30%',
  },
  selectedPriorityOption: {
    backgroundColor: '#FFF5F0',
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 2,
  },
  createButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});