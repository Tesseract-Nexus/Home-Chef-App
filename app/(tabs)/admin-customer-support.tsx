import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, MessageCircle, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Star, Phone, Mail, Search, Filter, Send, Eye, User } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/utils/constants';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { TabNavigation } from '@/components/ui/TabNavigation';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerImage: string;
  subject: string;
  description: string;
  category: 'order_issue' | 'payment_issue' | 'delivery_issue' | 'app_issue' | 'account_issue' | 'refund_request' | 'complaint' | 'suggestion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'escalated' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
  orderId?: string;
  rating?: number;
  feedback?: string;
}

interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'support' | 'admin';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'TKT001',
    customerName: 'Raj Patel',
    customerEmail: 'raj@example.com',
    customerPhone: '+91 98765 43210',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    subject: 'Order not delivered',
    description: 'My order #ORD125 was marked as delivered but I never received it.',
    category: 'delivery_issue',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'support_1',
    assignedToName: 'Priya Support',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    orderId: 'ORD125',
    messages: [
      {
        id: 'msg1',
        senderId: 'customer_1',
        senderName: 'Raj Patel',
        senderType: 'customer',
        message: 'My order was marked as delivered but I never received it.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'msg2',
        senderId: 'support_1',
        senderName: 'Priya Support',
        senderType: 'support',
        message: 'I understand your concern. Let me check with the delivery partner.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
      },
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT002',
    customerName: 'Anita Sharma',
    customerEmail: 'anita@example.com',
    customerPhone: '+91 98765 43211',
    customerImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
    subject: 'Refund request for cancelled order',
    description: 'I cancelled my order but haven\'t received the refund yet.',
    category: 'refund_request',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    orderId: 'ORD126',
    messages: [
      {
        id: 'msg3',
        senderId: 'customer_2',
        senderName: 'Anita Sharma',
        senderType: 'customer',
        message: 'I cancelled my order but haven\'t received the refund yet.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  },
];

const CATEGORIES = [
  { id: 'order_issue', label: 'Order Issues', color: '#000000' },
  { id: 'payment_issue', label: 'Payment Issues', color: '#000000' },
  { id: 'delivery_issue', label: 'Delivery Issues', color: '#000000' },
  { id: 'app_issue', label: 'App Issues', color: '#000000' },
  { id: 'account_issue', label: 'Account Issues', color: '#000000' },
  { id: 'refund_request', label: 'Refund Request', color: '#000000' },
  { id: 'complaint', label: 'Complaint', color: '#000000' },
  { id: 'suggestion', label: 'Suggestion', color: '#000000' },
];

export default function AdminCustomerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SAMPLE_TICKETS);
  const [selectedTab, setSelectedTab] = useState<'open' | 'in_progress' | 'resolved' | 'all'>('open');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#000000';
      case 'in_progress': return '#000000';
      case 'waiting_customer': return '#8E8E93';
      case 'escalated': return '#000000';
      case 'resolved': return '#06C167';
      case 'closed': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#06C167';
      case 'medium': return '#8E8E93';
      case 'high': return '#000000';
      case 'urgent': return '#000000';
      default: return '#8E8E93';
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: SupportMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'admin_1',
      senderName: 'Admin',
      senderType: 'admin',
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            messages: [...ticket.messages, message],
            updatedAt: new Date(),
            status: 'in_progress'
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

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date() }
        : ticket
    ));
  };

  const getFilteredTickets = () => {
    let filtered = tickets;

    if (selectedTab !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === selectedTab);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(ticket => 
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const renderTicketCard = (ticket: SupportTicket) => {
    const StatusIcon = getStatusIcon(ticket.status);
    
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
            <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
            <View style={styles.ticketMeta}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                <Text style={styles.priorityText}>{ticket.priority.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                <StatusIcon size={12} color="#FFFFFF" />
                <Text style={styles.statusText}>{ticket.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.ticketTime}>
            {ticket.updatedAt.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.customerSection}>
          <Image source={{ uri: ticket.customerImage }} style={styles.customerImage} />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{ticket.customerName}</Text>
            <Text style={styles.customerEmail}>{ticket.customerEmail}</Text>
            {ticket.orderId && (
              <Text style={styles.orderId}>Order: {ticket.orderId}</Text>
            )}
          </View>
        </View>

        <Text style={styles.ticketSubject}>{ticket.subject}</Text>
        <Text style={styles.ticketDescription} numberOfLines={2}>
          {ticket.description}
        </Text>

        <View style={styles.ticketFooter}>
          <Text style={styles.categoryText}>{CATEGORIES.find(c => c.id === ticket.category)?.label}</Text>
          <Text style={styles.messagesCount}>{ticket.messages.length} messages</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = (message: SupportMessage) => {
    const isSupport = message.senderType === 'support' || message.senderType === 'admin';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isSupport ? styles.supportMessage : styles.customerMessage
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
          isSupport ? styles.supportMessageText : styles.customerMessageText
        ]}>
          {message.message}
        </Text>
      </View>
    );
  };

  const TicketDetailsModal = () => (
    <Modal visible={showTicketModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Ticket #{selectedTicket?.ticketNumber}</Text>
          <TouchableOpacity onPress={() => setShowTicketModal(false)}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {selectedTicket && (
          <View style={styles.ticketDetailsContainer}>
            <ScrollView style={styles.messagesContainer}>
              <View style={styles.ticketDetailsHeader}>
                <Text style={styles.ticketDetailsTitle}>{selectedTicket.subject}</Text>
                <View style={styles.ticketDetailsMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedTicket.priority) }]}>
                    <Text style={styles.priorityText}>{selectedTicket.priority.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket.status) }]}>
                    <Text style={styles.statusText}>{selectedTicket.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.customerDetails}>
                  <Image source={{ uri: selectedTicket.customerImage }} style={styles.customerDetailImage} />
                  <View style={styles.customerDetailInfo}>
                    <Text style={styles.customerDetailName}>{selectedTicket.customerName}</Text>
                    <Text style={styles.customerDetailEmail}>{selectedTicket.customerEmail}</Text>
                    <Text style={styles.customerDetailPhone}>{selectedTicket.customerPhone}</Text>
                  </View>
                </View>
              </View>

              {selectedTicket.messages.map(renderMessage)}
            </ScrollView>

            <View style={styles.statusActions}>
              <Text style={styles.statusActionsTitle}>Update Status:</Text>
              <View style={styles.statusButtons}>
                {['in_progress', 'waiting_customer', 'resolved', 'closed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      selectedTicket.status === status && styles.activeStatusButton
                    ]}
                    onPress={() => updateTicketStatus(selectedTicket.id, status as SupportTicket['status'])}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      selectedTicket.status === status && styles.activeStatusButtonText
                    ]}>
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type your response..."
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

  const filteredTickets = getFilteredTickets();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Support</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tickets..."
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'open', label: 'Open', count: tickets.filter(t => t.status === 'open').length },
          { id: 'in_progress', label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
          { id: 'resolved', label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
          { id: 'all', label: 'All', count: tickets.length },
        ]}
        selectedTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab as typeof selectedTab)}
      />

      {/* Summary Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tickets.filter(t => t.status === 'open').length}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tickets.filter(t => t.status === 'in_progress').length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tickets.filter(t => t.status === 'resolved').length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100)}%</Text>
          <Text style={styles.statLabel}>Resolution Rate</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredTickets.length > 0 ? (
          filteredTickets.map(renderTicketCard)
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No tickets found"
            subtitle={searchQuery ? 'Try adjusting your search criteria' : 'No support tickets in this category'}
          />
        )}
      </ScrollView>

      <TicketDetailsModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  filterButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.text.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  ticketCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  ticketTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  customerEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  orderId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  ticketSubject: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ticketDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  messagesCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  ticketDetailsContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  ticketDetailsHeader: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  ticketDetailsTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  ticketDetailsMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerDetailImage: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.xxl,
    marginRight: SPACING.md,
  },
  customerDetailInfo: {
    flex: 1,
  },
  customerDetailName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  customerDetailEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  customerDetailPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  messageContainer: {
    marginBottom: SPACING.lg,
    maxWidth: '85%',
  },
  supportMessage: {
    alignSelf: 'flex-end',
  },
  customerMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  messageSender: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  supportMessageText: {
    backgroundColor: COLORS.text.primary,
    color: COLORS.text.white,
  },
  customerMessageText: {
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statusActions: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  statusActionsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  activeStatusButton: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  statusButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activeStatusButtonText: {
    color: COLORS.text.white,
    fontWeight: '600',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.md,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    maxHeight: 100,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.secondary,
  },
  sendButton: {
    backgroundColor: COLORS.text.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
});