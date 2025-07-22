import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Star, Clock, MapPin, ExternalLink, X, Heart, Share2 } from 'lucide-react-native';
import { useAds, AdConfig } from '@/hooks/useAds';

interface SponsoredContentProps {
  ads: AdConfig[];
  style?: any;
  maxItems?: number;
}

export const SponsoredContent: React.FC<SponsoredContentProps> = ({ 
  ads, 
  style,
  maxItems = 3
}) => {
  const { dismissAd, trackAdClick, trackAdImpression } = useAds();
  const [likedAds, setLikedAds] = useState<string[]>([]);
  const [trackedImpressions, setTrackedImpressions] = useState<string[]>([]);

  useEffect(() => {
    // Track impressions for all visible ads
    ads.slice(0, maxItems).forEach(ad => {
      if (!trackedImpressions.includes(ad.id)) {
        trackAdImpression(ad.id);
        setTrackedImpressions(prev => [...prev, ad.id]);
      }
    });
  }, [ads, maxItems, trackAdImpression, trackedImpressions]);

  const handleAdClick = React.useCallback((ad: AdConfig) => {
    trackAdClick(ad.id);
    console.log('Sponsored content clicked:', ad.title);
    // In a real app, navigate to target URL
  }, [trackAdClick]);

  const handleLike = React.useCallback((adId: string) => {
    setLikedAds(prev => 
      prev.includes(adId) 
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    );
  }, []);

  const handleShare = React.useCallback((ad: AdConfig) => {
    console.log('Share ad:', ad.title);
    // In a real app, implement sharing functionality
  }, []);

  const renderFoodSponsoredContent = (ad: AdConfig) => (
    <TouchableOpacity 
      key={ad.id}
      style={styles.foodCard}
      onPress={() => handleAdClick(ad)}
    >
      <View style={styles.foodImageContainer}>
        <Image source={{ uri: ad.imageUrl }} style={styles.foodImage} />
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={() => handleLike(ad.id)}
        >
          <Heart 
            size={16} 
            color={likedAds.includes(ad.id) ? "#FF6B35" : "#FFFFFF"} 
            fill={likedAds.includes(ad.id) ? "#FF6B35" : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.foodContent}>
        <Text style={styles.foodTitle}>{ad.title}</Text>
        <Text style={styles.foodDescription} numberOfLines={2}>
          {ad.description}
        </Text>
        
        <View style={styles.foodMeta}>
          <View style={styles.metaItem}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.metaText}>4.8</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={12} color="#666" />
            <Text style={styles.metaText}>25-30 min</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={12} color="#666" />
            <Text style={styles.metaText}>2.3 km</Text>
          </View>
        </View>

        <View style={styles.foodFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>₹299</Text>
            <Text style={styles.discountPrice}>₹209</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>30% OFF</Text>
            </View>
          </View>
          
          <View style={styles.foodActions}>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => handleShare(ad)}
            >
              <Share2 size={14} color="#7F8C8D" />
            </TouchableOpacity>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>{ad.actionText}</Text>
              <ExternalLink size={12} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.sponsorInfo}>Sponsored by {ad.sponsor}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLifestyleSponsoredContent = (ad: AdConfig) => (
    <TouchableOpacity 
      key={ad.id}
      style={styles.lifestyleCard}
      onPress={() => handleAdClick(ad)}
    >
      <Image source={{ uri: ad.imageUrl }} style={styles.lifestyleImage} />
      
      <View style={styles.lifestyleOverlay}>
        <View style={styles.lifestyleHeader}>
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
          </View>
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={() => dismissAd(ad.id)}
          >
            <X size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.lifestyleContent}>
          <Text style={styles.lifestyleTitle}>{ad.title}</Text>
          <Text style={styles.lifestyleDescription}>{ad.description}</Text>
          
          <View style={styles.lifestyleFooter}>
            <Text style={styles.lifestyleSponsor}>by {ad.sponsor}</Text>
            <View style={styles.lifestyleAction}>
              <Text style={styles.lifestyleActionText}>{ad.actionText}</Text>
              <ExternalLink size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDefaultSponsoredContent = (ad: AdConfig) => (
    <View key={ad.id} style={styles.defaultCard}>
      <View style={styles.defaultHeader}>
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => dismissAd(ad.id)}
        >
          <X size={14} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.defaultContent} onPress={() => handleAdClick(ad)}>
        <Image source={{ uri: ad.imageUrl }} style={styles.defaultImage} />
        
        <View style={styles.defaultInfo}>
          <Text style={styles.defaultTitle}>{ad.title}</Text>
          <Text style={styles.defaultDescription} numberOfLines={3}>
            {ad.description}
          </Text>
          
          <View style={styles.defaultFooter}>
            <Text style={styles.defaultSponsor}>by {ad.sponsor}</Text>
            <View style={styles.defaultAction}>
              <Text style={styles.defaultActionText}>{ad.actionText}</Text>
              <ExternalLink size={12} color="#FF6B35" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (ads.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sponsored Content</Text>
        <Text style={styles.sectionSubtitle}>Discover great offers and services</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ads.slice(0, maxItems).map(ad => {
          switch (ad.category) {
            case 'food':
            case 'restaurant':
              return renderFoodSponsoredContent(ad);
            case 'lifestyle':
            case 'tech':
              return renderLifestyleSponsoredContent(ad);
            default:
              return renderDefaultSponsoredContent(ad);
          }
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sponsoredBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sponsoredText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Food card styles
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    width: 280,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  foodImageContainer: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodContent: {
    padding: 16,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  foodDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 10,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sponsorInfo: {
    fontSize: 10,
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Lifestyle card styles
  lifestyleCard: {
    position: 'relative',
    borderRadius: 12,
    marginRight: 16,
    width: 300,
    height: 200,
    overflow: 'hidden',
  },
  lifestyleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lifestyleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  lifestyleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lifestyleContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  lifestyleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  lifestyleDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  lifestyleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lifestyleSponsor: {
    fontSize: 11,
    color: '#BDC3C7',
    fontStyle: 'italic',
  },
  lifestyleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  lifestyleActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Default card styles
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    width: 260,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
  },
  defaultContent: {
    flexDirection: 'row',
    padding: 12,
  },
  defaultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  defaultInfo: {
    flex: 1,
  },
  defaultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  defaultDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
    marginBottom: 8,
  },
  defaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultSponsor: {
    fontSize: 10,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  defaultAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  defaultActionText: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: '600',
  },
});