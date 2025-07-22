import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { X, ExternalLink, Star, Clock, MapPin } from 'lucide-react-native';
import { useAds } from '@/hooks/useAds';

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'inline';
  style?: any;
  context?: 'home' | 'menu' | 'cart' | 'orders';
}

const { width: screenWidth } = Dimensions.get('window');

export const AdBanner: React.FC<AdBannerProps> = ({ 
  position = 'bottom', 
  style,
  context = 'home'
}) => {
  const { shouldShowAds, bannerAds, dismissAd, trackAdImpression, trackAdClick } = useAds();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [hasTrackedCurrentAd, setHasTrackedCurrentAd] = useState(false);

  // Auto-rotate ads every 10 seconds
  useEffect(() => {
    if (bannerAds.length <= 1) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentAdIndex(prev => (prev + 1) % bannerAds.length);
      setHasTrackedCurrentAd(false); // Reset tracking for new ad
    }, 10000);

    return () => clearInterval(interval);
  }, [bannerAds.length, fadeAnim]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (bannerAds.length > 0 && !hasTrackedCurrentAd) {
      const currentAd = bannerAds[currentAdIndex];
      trackAdImpression(currentAd.id);
      setHasTrackedCurrentAd(true);
    }
  }, [currentAdIndex, bannerAds, trackAdImpression, hasTrackedCurrentAd]);

  if (!shouldShowAds || bannerAds.length === 0) {
    return null;
  }

  const currentAd = bannerAds[currentAdIndex];

  const handleDismiss = React.useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dismissAd(currentAd.id);
    });
  }, [slideAnim, dismissAd, currentAdIndex, bannerAds]);

  const handleAdClick = React.useCallback(() => {
    if (bannerAds.length === 0) return;
    const currentAd = bannerAds[currentAdIndex];
    trackAdClick(currentAd.id);
    console.log('Ad clicked:', currentAd.title);
    // In a real app, navigate to target URL or open external link
  }, [trackAdClick, currentAdIndex, bannerAds]);

  const renderAdContent = () => {
    switch (currentAd.category) {
      case 'food':
        return (
          <View style={styles.foodAdContent}>
            <Image source={{ uri: currentAd.imageUrl }} style={styles.foodAdImage} />
            <View style={styles.foodAdText}>
              <View style={styles.foodAdHeader}>
                <Text style={styles.adTitle}>{currentAd.title}</Text>
                <View style={styles.foodAdMeta}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.foodAdRating}>4.8</Text>
                  <Clock size={12} color="#666" />
                  <Text style={styles.foodAdTime}>30 min</Text>
                </View>
              </View>
              <Text style={styles.adDescription}>{currentAd.description}</Text>
              <View style={styles.foodAdFooter}>
                <Text style={styles.sponsorText}>Sponsored by {currentAd.sponsor}</Text>
                <TouchableOpacity style={styles.foodActionButton} onPress={handleAdClick}>
                  <Text style={styles.foodActionText}>{currentAd.actionText}</Text>
                  <ExternalLink size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'restaurant':
        return (
          <View style={styles.restaurantAdContent}>
            <Image source={{ uri: currentAd.imageUrl }} style={styles.restaurantAdImage} />
            <View style={styles.restaurantAdOverlay}>
              <Text style={styles.restaurantAdTitle}>{currentAd.title}</Text>
              <Text style={styles.restaurantAdDescription}>{currentAd.description}</Text>
              <View style={styles.restaurantAdLocation}>
                <MapPin size={12} color="#FFFFFF" />
                <Text style={styles.restaurantLocationText}>Multiple Locations</Text>
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.defaultAdContent}>
            <Image source={{ uri: currentAd.imageUrl }} style={styles.adImage} />
            <View style={styles.adText}>
              <Text style={styles.adTitle}>{currentAd.title}</Text>
              <Text style={styles.adDescription}>{currentAd.description}</Text>
              <View style={styles.adFooter}>
                <Text style={styles.sponsorText}>Sponsored by {currentAd.sponsor}</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleAdClick}>
                  <Text style={styles.actionText}>{currentAd.actionText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity style={styles.adContainer} onPress={handleAdClick}>
        {renderAdContent()}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
        <X size={16} color="#666" />
      </TouchableOpacity>

      {/* Ad indicators for multiple ads */}
      {bannerAds.length > 1 && (
        <View style={styles.indicators}>
          {bannerAds.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentAdIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      )}

      {/* Privacy notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyText}>Ad</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE082',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  adContainer: {
    overflow: 'hidden',
  },
  defaultAdContent: {
    flexDirection: 'row',
    padding: 12,
  },
  adImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  adText: {
    flex: 1,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 16,
  },
  adFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sponsorText: {
    fontSize: 10,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  foodAdContent: {
    flexDirection: 'row',
    padding: 12,
  },
  foodAdImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  foodAdText: {
    flex: 1,
  },
  foodAdHeader: {
    marginBottom: 6,
  },
  foodAdMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  foodAdRating: {
    fontSize: 11,
    color: '#2C3E50',
    fontWeight: '500',
    marginRight: 8,
  },
  foodAdTime: {
    fontSize: 11,
    color: '#666',
  },
  foodAdFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  foodActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  foodActionText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  restaurantAdContent: {
    position: 'relative',
    height: 120,
  },
  restaurantAdImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restaurantAdOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  restaurantAdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  restaurantAdDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  restaurantAdLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantLocationText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    zIndex: 1,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BDC3C7',
  },
  activeIndicator: {
    backgroundColor: '#FF6B35',
  },
  privacyNotice: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  privacyText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});