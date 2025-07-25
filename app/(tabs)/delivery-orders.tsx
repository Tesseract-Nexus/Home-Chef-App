import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, DollarSign, Navigation, Phone, MessageCircle, ChevronDown, ChevronUp, Car, CloudRain, Sun, Cloud, Zap, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContactActions } from '@/components/ui/ContactActions';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ICON_SIZES } from '@/utils/constants';
import { ChatButton } from '@/components/ChatButton';

const AVAILABLE_ORDERS = [
  {
    id: 'ORD127',
    customerName: 'Vikram Singh',
    chefName: 'Priya Sharma',
    chefImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    pickup: {
      address: 'Priya\'s Kitchen, Bandra West',
      coordinates: { lat: 19.0596, lng: 72.8295 }
    },
    dropoff: {
      address: '123 Linking Road, Bandra West',
      coordinates: { lat: 19.0544, lng: 72.8347 }
    },
    distance: '2.1 km',
    estimatedTime: '15 min',
    earnings: '₹95',
    orderValue: '₹450',
    items: ['Butter Chicken x2', 'Dal Makhani x1', 'Naan x4'],
    priority: 'high',
    orderTime: '3:45 PM',
    trafficConditions: {
      currentTraffic: 'moderate',
      estimatedDelay: '5-8 mins',
      suggestedRoute: 'Via Western Express Highway',
      alternateRoute: 'Via SV Road (slower but less congested)',
      peakHours: '4:00 PM - 7:00 PM',
      trafficScore: 6, // out of 10
    },
    weatherConditions: {
      temperature: 32,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 12,
      uvIndex: 8,
      recommendation: 'Stay hydrated, use sunscreen',
    },
  },
  {
    id: 'ORD128',
    customerName: 'Sneha Patel',
    chefName: 'Meera Patel',
    chefImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    pickup: {
      address: 'Meera\'s Kitchen, Andheri East',
      coordinates: { lat: 19.1136, lng: 72.8697 }
    },
    dropoff: {
      address: 'Versova Beach Road, Andheri',
      coordinates: { lat: 19.1317, lng: 72.8064 }
    },
    distance: '3.8 km',
    estimatedTime: '22 min',
    earnings: '₹120',
    orderValue: '₹680',
    items: ['Gujarati Thali x2', 'Dhokla x1'],
    priority: 'medium',
    orderTime: '4:10 PM',
    trafficConditions: {
      currentTraffic: 'heavy',
      estimatedDelay: '12-15 mins',
      suggestedRoute: 'Via Metro Line Road',
      alternateRoute: 'Via Link Road (avoid main junctions)',
      peakHours: '4:00 PM - 7:00 PM',
      trafficScore: 3,
    },
    weatherConditions: {
      temperature: 28,
      condition: 'rainy',
      humidity: 85,
      windSpeed: 18,
      uvIndex: 2,
      recommendation: 'Drive carefully, roads may be slippery',
    },
  },
  {
    id: 'ORD129',
    customerName: 'Rahul Sharma',
    chefName: 'Lakshmi Reddy',
    chefImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    pickup: {
      address: 'Lakshmi\'s Kitchen, Powai',
      coordinates: { lat: 19.1197, lng: 72.9056 }
    },
    dropoff: {
      address: 'Hiranandani Gardens, Powai',
      coordinates: { lat: 19.1136, lng: 72.9069 }
    },
    distance: '1.2 km',
    estimatedTime: '8 min',
    earnings: '₹65',
    orderValue: '₹320',
    items: ['Dosa x3', 'Sambar x2'],
    priority: 'low',
    orderTime: '4:25 PM',
    trafficConditions: {
      currentTraffic: 'light',
      estimatedDelay: '2-3 mins',
      suggestedRoute: 'Direct route via main road',
      alternateRoute: 'No alternate needed',
      peakHours: '4:00 PM - 7:00 PM',
      trafficScore: 8,
    },
    weatherConditions: {
      temperature: 30,
      condition: 'cloudy',
      humidity: 70,
      windSpeed: 8,
      uvIndex: 4,
      recommendation: 'Pleasant weather for delivery',
    },
  },
];

export default function DeliveryOrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [acceptedOrders, setAcceptedOrders] = useState<string[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const filteredOrders = selectedFilter === 'all' 
    ? AVAILABLE_ORDERS 
    : AVAILABLE_ORDERS.filter(order => order.priority === selectedFilter);

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            setAcceptedOrders(prev => [...prev, orderId]);
            Alert.alert('Order Accepted!', 'Navigate to pickup location to start delivery.');
          }
        }
      ]
    );
  };

  const handleNavigate = (location: { lat: number; lng: number }, address: string) => {
    Alert.alert('Navigation', `Opening maps to navigate to: ${address}`);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#7F8C8D';
    }
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'light': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'heavy': return '#F44336';
      default: return '#7F8C8D';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return Sun;
      case 'rainy': return CloudRain;
      case 'cloudy': return Cloud;
      default: return Sun;
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return '#FF9800';
      case 'rainy': return '#2196F3';
      case 'cloudy': return '#9E9E9E';
      default: return '#FF9800';
    }
  };

  const renderOrderCard = (order: typeof AVAILABLE_ORDERS[0]) => {
    const isAccepted = acceptedOrders.includes(order.id);
    const isExpanded = expandedOrders.includes(order.id);
    const WeatherIcon = getWeatherIcon(order.weatherConditions.condition);

    return (
      <View key={order.id} style={[styles.orderCard, isAccepted && styles.acceptedOrderCard]}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <StatusIndicator 
              status={order.priority} 
              type="general"
              size="small"
            />
          </View>
          <Text style={styles.orderTime}>{order.orderTime}</Text>
        </View>

        <View style={styles.customerSection}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.orderValue}>Order Value: {order.orderValue}</Text>
        </View>

        <View style={styles.chefSection}>
          <Image source={{ uri: order.chefImage }} style={styles.chefImage} />
          <View style={styles.chefInfo}>
            <Text style={styles.chefName}>Chef: {order.chefName}</Text>
            <Text style={styles.itemsList}>{order.items.join(', ')}</Text>
          </View>
        </View>

        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <View style={styles.pickupDot} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationAddress}>{order.pickup.address}</Text>
            </View>
            <TouchableOpacity 
              style={styles.navigateButton}
              onPress={() => handleNavigate(order.pickup.coordinates, order.pickup.address)}
            >
              <Navigation size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationConnector} />

          <View style={styles.locationRow}>
            <View style={styles.dropoffDot} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Drop-off</Text>
              <Text style={styles.locationAddress}>{order.dropoff.address}</Text>
            </View>
            <TouchableOpacity 
              style={styles.navigateButton}
              onPress={() => handleNavigate(order.dropoff.coordinates, order.dropoff.address)}
            >
              <Navigation size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Collapsible Traffic & Weather Info */}
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => toggleOrderExpansion(order.id)}
        >
          <View style={styles.expandButtonContent}>
            <View style={styles.quickInfo}>
              <View style={styles.trafficQuickInfo}>
                <Car size={14} color={getTrafficColor(order.trafficConditions.currentTraffic)} />
                <Text style={[styles.quickInfoText, { color: getTrafficColor(order.trafficConditions.currentTraffic) }]}>
                  {order.trafficConditions.currentTraffic.toUpperCase()}
                </Text>
              </View>
              <View style={styles.weatherQuickInfo}>
                <WeatherIcon size={14} color={getWeatherColor(order.weatherConditions.condition)} />
                <Text style={[styles.quickInfoText, { color: getWeatherColor(order.weatherConditions.condition) }]}>
                  {order.weatherConditions.temperature}°C
                </Text>
              </View>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} color="#7F8C8D" />
            ) : (
              <ChevronDown size={20} color="#7F8C8D" />
            )}
          </View>
          <Text style={styles.expandButtonText}>
            {isExpanded ? 'Hide' : 'Show'} Traffic & Weather Info
          </Text>
        </TouchableOpacity>

        {/* Expanded Traffic & Weather Details */}
        {isExpanded && (
          <View style={styles.expandedInfo}>
            {/* Traffic Conditions */}
            <View style={styles.trafficSection}>
              <View style={styles.sectionHeader}>
                <Car size={18} color="#FF6B35" />
                <Text style={styles.sectionTitle}>Traffic Conditions</Text>
              </View>
              
              <View style={styles.trafficDetails}>
                <View style={styles.trafficRow}>
                  <Text style={styles.trafficLabel}>Current Traffic:</Text>
                  <View style={styles.trafficStatus}>
                    <View style={[styles.trafficDot, { backgroundColor: getTrafficColor(order.trafficConditions.currentTraffic) }]} />
                    <Text style={[styles.trafficValue, { color: getTrafficColor(order.trafficConditions.currentTraffic) }]}>
                      {order.trafficConditions.currentTraffic.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.trafficRow}>
                  <Text style={styles.trafficLabel}>Estimated Delay:</Text>
                  <Text style={styles.trafficValue}>{order.trafficConditions.estimatedDelay}</Text>
                </View>
                
                <View style={styles.trafficRow}>
                  <Text style={styles.trafficLabel}>Traffic Score:</Text>
                  <View style={styles.trafficScoreContainer}>
                    <View style={styles.trafficScoreBar}>
                      <View style={[
                        styles.trafficScoreFill, 
                        { 
                          width: `${order.trafficConditions.trafficScore * 10}%`,
                          backgroundColor: order.trafficConditions.trafficScore >= 7 ? '#4CAF50' : 
                                         order.trafficConditions.trafficScore >= 4 ? '#FF9800' : '#F44336'
                        }
                      ]} />
                    </View>
                    <Text style={styles.trafficScoreText}>{order.trafficConditions.trafficScore}/10</Text>
                  </View>
                </View>
              </View>

              <View style={styles.routeRecommendations}>
                <View style={styles.routeCard}>
                  <View style={styles.routeHeader}>
                    <CheckCircle size={16} color="#4CAF50" />
                    <Text style={styles.routeTitle}>Suggested Route</Text>
                  </View>
                  <Text style={styles.routeDescription}>{order.trafficConditions.suggestedRoute}</Text>
                </View>
                
                <View style={styles.routeCard}>
                  <View style={styles.routeHeader}>
                    <AlertTriangle size={16} color="#FF9800" />
                    <Text style={styles.routeTitle}>Alternate Route</Text>
                  </View>
                  <Text style={styles.routeDescription}>{order.trafficConditions.alternateRoute}</Text>
                </View>
              </View>

              <View style={styles.peakHoursInfo}>
                <Clock size={14} color="#FF6B35" />
                <Text style={styles.peakHoursText}>Peak Hours: {order.trafficConditions.peakHours}</Text>
              </View>
            </View>

            {/* Weather Conditions */}
            <View style={styles.weatherSection}>
              <View style={styles.sectionHeader}>
                <WeatherIcon size={18} color={getWeatherColor(order.weatherConditions.condition)} />
                <Text style={styles.sectionTitle}>Weather Conditions</Text>
              </View>
              
              <View style={styles.weatherGrid}>
                <View style={styles.weatherCard}>
                  <Text style={styles.weatherValue}>{order.weatherConditions.temperature}°C</Text>
                  <Text style={styles.weatherLabel}>Temperature</Text>
                </View>
                <View style={styles.weatherCard}>
                  <Text style={styles.weatherValue}>{order.weatherConditions.humidity}%</Text>
                  <Text style={styles.weatherLabel}>Humidity</Text>
                </View>
                <View style={styles.weatherCard}>
                  <Text style={styles.weatherValue}>{order.weatherConditions.windSpeed} km/h</Text>
                  <Text style={styles.weatherLabel}>Wind Speed</Text>
                </View>
                <View style={styles.weatherCard}>
                  <Text style={styles.weatherValue}>UV {order.weatherConditions.uvIndex}</Text>
                  <Text style={styles.weatherLabel}>UV Index</Text>
                </View>
              </View>

              <View style={styles.weatherRecommendation}>
                <View style={styles.recommendationHeader}>
                  {order.weatherConditions.condition === 'rainy' ? (
                    <AlertTriangle size={16} color="#F44336" />
                  ) : (
                    <CheckCircle size={16} color="#4CAF50" />
                  )}
                  <Text style={styles.recommendationTitle}>Weather Advisory</Text>
                </View>
                <Text style={styles.recommendationText}>{order.weatherConditions.recommendation}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.deliveryInfo}>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#666" />
            <Text style={styles.infoText}>{order.distance}</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={16} color="#666" />
            <Text style={styles.infoText}>{order.estimatedTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <DollarSign size={16} color="#4CAF50" />
            <Text style={styles.earningsText}>{order.earnings}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <ContactActions
            phone="+91 98765 43210"
            variant="horizontal"
            size="small"
          />
          
          {/* Chat with Customer/Chef */}
          <ChatButton
            orderId={order.id}
            chatType="customer-delivery"
            size="small"
            variant="secondary"
          />
          
          <TouchableOpacity 
            style={[styles.acceptButton, isAccepted && styles.acceptedButton]}
            onPress={() => handleAcceptOrder(order.id)}
            disabled={isAccepted}
          >
            <Text style={[styles.acceptButtonText, isAccepted && styles.acceptedButtonText]}>
              {isAccepted ? 'Accepted' : 'Accept Order'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Orders</Text>
        <Text style={styles.subtitle}>{filteredOrders.length} orders available</Text>
      </View>

      {/* Priority Filter */}
      <View style={styles.filterContainer}>
        {['all', 'high', 'medium', 'low'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilterButton,
              filter !== 'all' && { borderColor: getPriorityColor(filter) }
            ]}
            onPress={() => setSelectedFilter(filter as typeof selectedFilter)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter && styles.activeFilterButtonText,
              filter !== 'all' && selectedFilter === filter && { color: getPriorityColor(filter) }
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <EmptyState
            icon={Truck}
            title="No orders available"
            subtitle={
              selectedFilter === 'all' 
                ? 'Check back later for new delivery opportunities'
                : `No ${selectedFilter} priority orders available`
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
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
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  activeFilterButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  acceptedOrderCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  customerSection: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  chefSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  chefImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  locationSection: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginRight: 12,
  },
  locationConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 5,
    marginVertical: 4,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#2C3E50',
  },
  navigateButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  earningsText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptedButton: {
    backgroundColor: '#E8F5E8',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptedButtonText: {
    color: '#4CAF50',
  },
  expandButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  expandButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  trafficQuickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherQuickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickInfoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  expandedInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  trafficSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  trafficDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  trafficRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  trafficLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  trafficValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  trafficStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trafficDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trafficScoreBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  trafficScoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  trafficScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  routeRecommendations: {
    gap: 8,
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  routeDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  peakHoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  peakHoursText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  weatherSection: {
    marginBottom: 0,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  weatherCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  weatherLabel: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  weatherRecommendation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  recommendationText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});