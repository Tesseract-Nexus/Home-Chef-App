import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { X, ExternalLink, Star, Clock, MapPin, Heart } from 'lucide-react-native';
import { useAds, AdConfig } from '@/hooks/useAds';

interface NativeAdProps {
  ad: AdConfig;
  style?: any;
  variant?: 'card' | 'list' | 'minimal';
}

export const NativeAd: React.FC<NativeAdProps> = ({ 
  ad, 
  style,
  variant = 'card'
}) => {
  const { dismissAd, trackAdClick, trackAdImpression } = useAds();
  const [isLiked, setIsLiked] = useState(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  useEffect(() => {
    // Track impression only once when component mounts
    if (!hasTrackedImpression) {
      trackAdImpression(ad.id);
      setHasTrackedImpression(true);
    }
  }, [ad.id, hasTrackedImpression, trackAdImpression]);

  const handleAdClick = React.useCallback(() => {
    trackAdClick(ad.id);
    console.log('Native ad clicked:', ad.title);
    // In a real app, navigate to target URL
  }, [ad.id, trackAdClick]);

  const handleDismiss = React.useCallback(() => {
    dismissAd(ad.id);
  }, [ad.id, dismissAd]);

  const handleLike = React.useCallback(() => {
    setIsLiked(!isLiked);
    // In a real app, save user preference
  }, [isLiked]);

  const renderCardVariant = () => (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.cardHeader}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Sponsored</Text>
        </View>
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <X size={14} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cardContent} onPress={handleAdClick}>
        <Image source={{ uri: ad.imageUrl }} style={styles.cardImage} />
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{ad.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {ad.description}
          </Text>
          
          {ad.category === 'food' && (
            <View style={styles.foodMeta}>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock size={12} color="#666" />
                <Text style={styles.timeText}>25-30 min</Text>
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={12} color="#666" />
                <Text style={styles.locationText}>2.3 km</Text>
              </View>
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.sponsorText}>by {ad.sponsor}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.likeButton}
                onPress={handleLike}
              >
                <Heart 
                  size={16} 
                  color={isLiked ? "#FF6B35" : "#BDC3C7"} 
                  fill={isLiked ? "#FF6B35" : "transparent"}
                />
              </TouchableOpacity>
              <View style={styles.actionButton}>
                <Text style={styles.actionText}>{ad.actionText}</Text>
                <ExternalLink size={12} color="#FF6B35" />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderListVariant = () => (
    <View style={[styles.listContainer, style]}>
      <View style={styles.listHeader}>
        <Text style={styles.listAdBadge}>Sponsored</Text>
        <TouchableOpacity style={styles.listDismissButton} onPress={handleDismiss}>
          <X size={12} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.listContent} onPress={handleAdClick}>
        <Image source={{ uri: ad.imageUrl }} style={styles.listImage} />
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{ad.title}</Text>
          <Text style={styles.listDescription} numberOfLines={1}>
            {ad.description}
          </Text>
          <View style={styles.listFooter}>
            <Text style={styles.listSponsor}>by {ad.sponsor}</Text>
            <View style={styles.listAction}>
              <Text style={styles.listActionText}>{ad.actionText}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderMinimalVariant = () => (
    <TouchableOpacity 
      style={[styles.minimalContainer, style]}
      onPress={handleAdClick}
    >
      <View style={styles.minimalContent}>
        <Image source={{ uri: ad.imageUrl }} style={styles.minimalImage} />
        <View style={styles.minimalInfo}>
          <Text style={styles.minimalTitle}>{ad.title}</Text>
          <Text style={styles.minimalSponsor}>Sponsored by {ad.sponsor}</Text>
        </View>
        <TouchableOpacity style={styles.minimalDismiss} onPress={handleDismiss}>
          <X size={12} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {(() => {
        switch (variant) {
          case 'list':
            return renderListVariant();
          case 'minimal':
            return renderMinimalVariant();
          default:
            return renderCardVariant();
        }
      })()}
    </>
  );
};

const styles = StyleSheet.create({
  // Card variant styles
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  adBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adBadgeText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  cardContent: {
    padding: 12,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardInfo: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sponsorText: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likeButton: {
    padding: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  actionText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },

  // List variant styles
  listContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  listAdBadge: {
    fontSize: 9,
    color: '#2196F3',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listDismissButton: {
    padding: 2,
  },
  listContent: {
    flexDirection: 'row',
    padding: 12,
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  listDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listSponsor: {
    fontSize: 10,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  listAction: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listActionText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },

  // Minimal variant styles
  minimalContainer: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  minimalImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 8,
  },
  minimalInfo: {
    flex: 1,
  },
  minimalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 1,
  },
  minimalSponsor: {
    fontSize: 9,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  minimalDismiss: {
    padding: 4,
  },
});