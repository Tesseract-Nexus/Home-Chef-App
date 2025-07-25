import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Send, Paperclip, MessageCircle, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Star, Phone, Mail, Search, Filter } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContactActions } from '@/components/ui/ContactActions';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ICON_SIZES } from '@/utils/constants';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'escalated' | 'resolved' | 'closed';
  createdBy: string;
  createdByName: string;
  createdByType: 'customer' | 'chef' | 'delivery' | 'admin';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
  attachments?: string[];
  orderId?: string;
  rating?: number;
  feedback?: string;
}

interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'chef' | 'delivery' | 'admin' | 'support';
  message: string;
  timestamp: Date;
  isInternal: boolean;
  attachments?: string[];
}

const SUPPORT_CATEGORIES = {
  customer: [
    { id: 'order_issue', label: 'Order Issues', icon: '🍽️', description: 'Problems with orders, delays, wrong items' },
    { id: 'payment_issue', label: 'Payment Issues', icon: '💳', description: 'Payment failures, refunds, billing' },
    { id: 'delivery_issue', label: 'Delivery Issues', icon: '🚚', description: 'Late delivery, missing orders, delivery person issues' },
    { id: 'app_issue', label: 'App Issues', icon: '📱', description: 'App crashes, login problems, technical issues' },
    { id: 'account_issue', label: 'Account Issues', icon: '👤', description: 'Profile, address, password issues' },
    { id: 'refund_request', label: 'Refund Request', icon: '💰', description: 'Request refund for orders' },
    { id: 'complaint', label: 'Complaint', icon: '😠', description: 'Service complaints, food quality issues' },
    { id: 'suggestion', label: 'Suggestion', icon: '💡', description: 'Feature requests, improvements' },
  ],
  chef: [
    { id: 'payout_issue', label: 'Payout Issues', icon: '💰', description: 'Payment delays, incorrect amounts' },
    { id: 'order_management', label: 'Order Management', icon: '📋', description: 'Order processing, customer issues' },
    { id: 'app_technical', label: 'App Technical', icon: '⚙️', description: 'Chef app issues, menu updates' },
    { id: 'account_verification', label: 'Account Verification', icon: '✅', description: 'Document verification, profile issues' },
    { id: 'commission_query', label: 'Commission Query', icon: '📊', description: 'Platform fee questions, calculations' },
    { id: 'customer_complaint', label: 'Customer Complaint', icon: '🗣️', description: 'Handle customer feedback' },
    { id: 'menu_help', label: 'Menu Help', icon: '📝', description: 'Menu setup, pricing, categories' },
    { id: 'general_support', label: 'General Support', icon: '❓', description: 'Other chef-related queries' },
  ],
  delivery: [
    { id: 'earnings_issue', label: 'Earnings Issues', icon: '💵', description: 'Payment problems, incorrect earnings' },
    { id: 'delivery_app', label: 'Delivery App', icon: '📱', description: 'App issues, navigation problems' },
    { id: 'vehicle_issue', label: 'Vehicle Issues', icon: '🏍️', description: 'Vehicle registration, insurance' },
    { id: 'customer_issue', label: 'Customer Issues', icon: '👥', description: 'Difficult customers, delivery problems' },
    { id: 'route_optimization', label: 'Route Issues', icon: '🗺️', description: 'Navigation, route problems' },
    { id: 'safety_concern', label: 'Safety Concerns', icon: '🛡️', description: 'Safety issues, incidents' },
    { id: 'account_help', label: 'Account Help', icon: '👤', description: 'Profile, documents, verification' },
    { id: 'general_query', label: 'General Query', icon: '❓', description: 'Other delivery-related questions' },
  ],
  admin: [
    { id: 'system_issue', label: 'System Issues', icon: '⚠️', description: 'Platform technical problems' },
    { id: 'user_management', label: 'User Management', icon: '👥', description: 'User account issues, permissions' },
    { id: 'financial_query', label: 'Financial Query', icon: '💰', description: 'Revenue, payouts, financial reports' },
    { id: 'operational_issue', label: 'Operational Issue', icon: '⚙️', description: 'Business operations, processes' },
    { id: 'compliance_issue', label: 'Compliance Issue', icon: '📋', description: 'Legal, regulatory compliance' },
    { id: 'feature_request', label: 'Feature Request', icon: '🚀', description: 'New features, improvements' },
    { id: 'staff_support', label: 'Staff Support', icon: '👨‍💼', description: 'Internal staff assistance' },
    { id: 'emergency', label: 'Emergency', icon: '🚨', description: 'Urgent platform issues' },
  ],
};

const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: 'TKT001',
    title: 'Order not delivered',
    description: 'My order #ORD125 was marked as delivered but I never received it. The delivery person said they delivered it to my address but I was home all day.',
    category: 'delivery_issue',
    priority: 'high',
    status: 'in_progress',
    createdBy: 'customer_1',
    createdByName: 'Raj Patel',
    createdByType: 'customer',
    assignedTo: 'support_1',
    assignedToName: 'Priya Support',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    orderId: 'ORD125',
    messages: [
      {
        id: 'msg1',
        ticketId: 'TKT001',
        senderId: 'customer_1',
        senderName: 'Raj Patel',
        senderType: 'customer',
        message: 'My order #ORD125 was marked as delivered but I never received it. The delivery person said they delivered it to my address but I was home all day.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isInternal: false,
      },
      {
        id: 'msg2',
        ticketId: 'TKT001',
        senderId: 'support_1',
        senderName: 'Priya Support',
        senderType: 'support',
        message: 'Hi Raj, I understand your concern. Let me check with the delivery partner and get back to you within 30 minutes with an update.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        isInternal: false,
      },
      {
        id: 'msg3',
        ticketId: 'TKT001',
        senderId: 'support_1',
        senderName: 'Priya Support',
        senderType: 'support',
        message: 'Internal note: Contacted delivery partner - they confirmed delivery to wrong address. Processing refund.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        isInternal: true,
      },
    ],
  },
  {
    id: 'TKT002',
    title: 'Payout not received',
    description: 'I have not received my weekly payout for last week. The amount was ₹12,450 and it should have been credited on Friday.',
    category: 'payout_issue',
    priority: 'medium',
    status: 'open',
    createdBy: 'chef_1',
    createdByName: 'Priya Sharma',
    createdByType: 'chef',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    messages: [
      {
        id: 'msg4',
        ticketId: 'TKT002',
        senderId: 'chef_1',
        senderName: 'Priya Sharma',
        senderType: 'chef',
        message: 'I have not received my weekly payout for last week. The amount was ₹12,450 and it should have been credited on Friday.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isInternal: false,
      },
    ],
  },
];

export default function SupportScreen() {
  const { user, userRole } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>(SAMPLE_TICKETS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    orderId: '',
  });

  const userTickets = tickets.filter(ticket => 
    userRole === 'admin' || ticket.createdBy === user?.id
  );

  const filteredTickets = userTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategories = () => {
    if (!userRole) return [];
    return SUPPORT_CATEGORIES[userRole as keyof typeof SUPPORT_CATEGORIES] || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'urgent': return '#9C27B0';
      case 'critical': return '#000000';
      default: return '#7F8C8D';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#2196F3';
      case 'in_progress': return '#FF9800';
      case 'waiting_customer': return '#9C27B0';
      case 'escalated': return '#F44336';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#7F8C8D';
      default: return '#7F8C8D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return MessageCircle;
      case 'in_progress': return Clock;
      case 'waiting_customer': return AlertTriangle;
      case 'escalated': return AlertTriangle;
      case 'resolved': return CheckCircle;
      case 'closed': return CheckCircle;
      default: return MessageCircle;
    }
  };

  const handleCreateTicket = () => {
    if (!ticketForm.title || !ticketForm.description || !ticketForm.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newTicket: SupportTicket = {
      id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
      title: ticketForm.title,
      description: ticketForm.description,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: 'open',
      createdBy: user?.id || '',
      createdByName: user?.name || '',
      createdByType: userRole as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderId: ticketForm.orderId,
      messages: [
        {
          id: `msg_${Date.now()}`,
          ticketId: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
          senderId: user?.id || '',
          senderName: user?.name || '',
          senderType: userRole as any,
          message: ticketForm.description,
          timestamp: new Date(),
          isInternal: false,
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);
    setTicketForm({ title: '', description: '', category: '', priority: 'medium', orderId: '' });
    setShowCreateModal(false);
    Alert.alert('Success', 'Support ticket created successfully!');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: SupportMessage = {
      id: `msg_${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: user?.id || '',
      senderName: user?.name || '',
      senderType: userRole as any,
      message: newMessage.trim(),
      timestamp: new Date(),
      isInternal: false,
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            messages: [...ticket.messages, message],
            updatedAt: new Date(),
            status: ticket.status === 'waiting_customer' ? 'in_progress' : ticket.status
          }
        : ticket
    ));

    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      updatedAt: new Date()
    } : null);

    setNewMessage('');
  };

  const renderTicketCard = (ticket: SupportTicket) => {
    const StatusIcon = getStatusIcon(ticket.status);
    const category = getCategories().find(cat => cat.id === ticket.category);
    const unreadMessages = ticket.messages.filter(msg => 
      msg.senderType === 'support' && msg.senderId !== user?.id
    ).length;

    return (
      <TouchableOpacity 
        key={ticket.id} 
        style={styles.ticketCard}
        onPress={() => {
          setSelectedTicket(ticket);
          setShowTicketModal(true);
        }}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketId}>#{ticket.id}</Text>
            <View style={styles.ticketMeta}>
              <StatusIndicator status={ticket.priority} type="general" size="small" />
              <StatusIndicator status={ticket.status} type="general" size="small" />
            </View>
          </View>
          <Text style={styles.ticketTime}>
            {ticket.updatedAt.toLocaleDateString()} • {ticket.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.ticketContent}>
          <View style={styles.categorySection}>
            <Text style={styles.categoryEmoji}>{category?.icon}</Text>
            <Text style={styles.categoryName}>{category?.label}</Text>
          </View>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <Text style={styles.ticketDescription} numberOfLines={2}>
            {ticket.description}
          </Text>
        </View>

        <View style={styles.ticketFooter}>
          <View style={styles.ticketCreator}>
            <Text style={styles.creatorText}>
              Created by: {ticket.createdByName} ({ticket.createdByType})
            </Text>
            {ticket.orderId && (
              <Text style={styles.orderIdText}>Order: #{ticket.orderId}</Text>
            )}
          </View>
          <View style={styles.ticketActions}>
            {unreadMessages > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadMessages}</Text>
              </View>
            )}
            <Text style={styles.messagesCount}>{ticket.messages.length} messages</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = (message: SupportMessage) => {
    const isOwnMessage = message.senderId === user?.id;
    const isSupport = message.senderType === 'support';

    if (message.isInternal && userRole !== 'admin') return null;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          message.isInternal && styles.internalMessage
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.messageSender}>
            {message.senderName} {isSupport && '(Support)'}
          </Text>
          <Text style={styles.messageTime}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          message.isInternal && styles.internalMessageText
        ]}>
          {message.message}
        </Text>
        {message.isInternal && (
          <Text style={styles.internalLabel}>Internal Note</Text>
        )}
      </View>
    );
  };

  const CreateTicketModal = () => (
    <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Support Ticket</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getCategories().map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    ticketForm.category === category.id && styles.selectedCategoryOption
                  ]}
                  onPress={() => setTicketForm(prev => ({ ...prev, category: category.id }))}
                >
                  <Text style={styles.categoryOptionEmoji}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryOptionText,
                    ticketForm.category === category.id && styles.selectedCategoryOptionText
                  ]}>
                    {category.label}
                  </Text>
                  <Text style={styles.categoryOptionDescription}>{category.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Priority</Text>
            <View style={styles.prioritySelector}>
              {['low', 'medium', 'high', 'urgent'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    ticketForm.priority === priority && styles.selectedPriorityOption,
                    { borderColor: getPriorityColor(priority) }
                  ]}
                  onPress={() => setTicketForm(prev => ({ ...prev, priority: priority as any }))}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    ticketForm.priority === priority && { color: getPriorityColor(priority) }
                  ]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title *</Text>
            <TextInput
              style={styles.formInput}
              value={ticketForm.title}
              onChangeText={(text) => setTicketForm(prev => ({ ...prev, title: text }))}
              placeholder="Brief description of your issue"
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Order ID (Optional)</Text>
            <TextInput
              style={styles.formInput}
              value={ticketForm.orderId}
              onChangeText={(text) => setTicketForm(prev => ({ ...prev, orderId: text }))}
              placeholder="e.g., ORD125"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={ticketForm.description}
              onChangeText={(text) => setTicketForm(prev => ({ ...prev, description: text }))}
              placeholder="Please provide detailed information about your issue..."
              multiline
              numberOfLines={5}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{ticketForm.description.length}/1000</Text>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateTicket}>
            <Text style={styles.createButtonText}>Create Ticket</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const TicketDetailsModal = () => (
    <Modal visible={showTicketModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Ticket #{selectedTicket?.id}</Text>
          <TouchableOpacity onPress={() => setShowTicketModal(false)}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        {selectedTicket && (
          <View style={styles.ticketDetailsContainer}>
            <ScrollView style={styles.messagesContainer}>
              <View style={styles.ticketDetailsHeader}>
                <Text style={styles.ticketDetailsTitle}>{selectedTicket.title}</Text>
                <View style={styles.ticketDetailsMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedTicket.priority) }]}>
                    <Text style={styles.priorityText}>{selectedTicket.priority.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket.status) }]}>
                    <Text style={styles.statusText}>{selectedTicket.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {selectedTicket.messages.map(renderMessage)}
            </ScrollView>

            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type your message..."
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Support Center</Text>
        <TouchableOpacity style={styles.createTicketButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tickets..."
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'all' && styles.activeFilterChip]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.activeFilterChipText]}>
              All ({userTickets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'open' && styles.activeFilterChip]}
            onPress={() => setSelectedStatus('open')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'open' && styles.activeFilterChipText]}>
              Open ({userTickets.filter(t => t.status === 'open').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'in_progress' && styles.activeFilterChip]}
            onPress={() => setSelectedStatus('in_progress')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'in_progress' && styles.activeFilterChipText]}>
              In Progress ({userTickets.filter(t => t.status === 'in_progress').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'resolved' && styles.activeFilterChip]}
            onPress={() => setSelectedStatus('resolved')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'resolved' && styles.activeFilterChipText]}>
              Resolved ({userTickets.filter(t => t.status === 'resolved').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Support Info */}
      <View style={styles.supportInfo}>
        <ContactActions
          phone="+91 1800-123-4567"
          email="support@homechef.com"
          variant="horizontal"
          size="medium"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredTickets.length > 0 ? (
          filteredTickets.map(renderTicketCard)
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No support tickets found"
            subtitle={searchQuery ? 'Try adjusting your search criteria' : 'Create your first support ticket to get help'}
            actionText="Create Ticket"
            onActionPress={() => setShowCreateModal(true)}
          />
        )}
      </ScrollView>

      <CreateTicketModal />
      <TicketDetailsModal />
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
  createTicketButton: {
    backgroundColor: '#FF6B35',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF5F0',
  },
  quickFilters: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  supportInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  ticketContent: {
    marginBottom: 12,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCreator: {
    flex: 1,
  },
  creatorText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  orderIdText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  ticketActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  messagesCount: {
    fontSize: 12,
    color: '#7F8C8D',
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
  modalContent: {
    flex: 1,
    padding: 20,
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
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: 160,
    alignItems: 'center',
  },
  selectedCategoryOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  categoryOptionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedCategoryOptionText: {
    color: '#FF6B35',
  },
  categoryOptionDescription: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedPriorityOption: {
    backgroundColor: '#FFF5F0',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  createButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketDetailsContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  ticketDetailsHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  ticketDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  ticketDetailsMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  internalMessage: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
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
    color: '#7F8C8D',
  },
  messageTime: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    borderRadius: 12,
  },
  ownMessageText: {
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
  },
  otherMessageText: {
    backgroundColor: '#FFFFFF',
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  internalMessageText: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
  },
  internalLabel: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#2C3E50',
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 20,
  },
});