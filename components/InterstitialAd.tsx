import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions, Animated } from 'react-native';
import { X, ExternalLink, Play, Volume2, VolumeX } from 'lucide-react-native';
import { useAds, AdConfig } from '@/hooks/useAds';

interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  ad: AdConfig;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const InterstitialAd: React.FC<InterstitialAdProps> = ({ visible, onClose, ad }) => {
  const { trackAdClick, trackAdImpression } = useAds();
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Track impression when ad becomes visible
      trackAdImpression(ad.id);
      
      // Animate ad entrance
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // Reset state when modal closes
      setCountdown(5);
      setCanClose(false);
      setIsVideoPlaying(false);
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
    }
  }, [visible, ad.id, trackAdImpression, scaleAnim, fadeAnim]);

  const handleClose = () => {
    if (!canClose) return;
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleAdClick = () => {
    trackAdClick(ad.id);
    console.log('Interstitial ad clicked:', ad.title);
    // In a real app, navigate to target URL
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    // In a real app, start video playback
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderVideoAd = () => (
    <View style={styles.videoContainer}>
      <Image source={{ uri: ad.imageUrl }} style={styles.videoThumbnail} />
      
      {!isVideoPlaying && (
        <TouchableOpacity style={styles.playButton} onPress={handleVideoPlay}>
          <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
      )}

      {isVideoPlaying && (
        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
          {isMuted ? (
            <VolumeX size={20} color="#FFFFFF" />
          ) : (
            <Volume2 size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.videoOverlay}>
        <Text style={styles.videoTitle}>{ad.title}</Text>
        <Text style={styles.videoDescription}>{ad.description}</Text>
      </View>
    </View>
  );

  const renderImageAd = () => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: ad.imageUrl }} style={styles.adMainImage} />
      <View style={styles.imageOverlay}>
        <Text style={styles.imageTitle}>{ad.title}</Text>
        <Text style={styles.imageDescription}>{ad.description}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          {/* Close button with countdown */}
          <View style={styles.header}>
            <View style={styles.adLabel}>
              <Text style={styles.adLabelText}>Advertisement</Text>
              <Text style={styles.sponsorLabel}>by {ad.sponsor}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.closeButton, !canClose && styles.disabledCloseButton]}
              onPress={handleClose}
              disabled={!canClose}
            >
              {canClose ? (
                <X size={20} color="#FFFFFF" />
              ) : (
                <Text style={styles.countdownText}>{countdown}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Ad content */}
          <TouchableOpacity style={styles.adContent} onPress={handleAdClick}>
            {ad.type === 'video' ? renderVideoAd() : renderImageAd()}
          </TouchableOpacity>

          {/* Action section */}
          <View style={styles.actionSection}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Interested?</Text>
              <Text style={styles.actionSubtitle}>Tap to learn more</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleAdClick}>
              <Text style={styles.actionButtonText}>{ad.actionText}</Text>
              <ExternalLink size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((5 - countdown) / 5) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {canClose ? 'You can close this ad' : `Ad closes in ${countdown}s`}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  adLabel: {
    flex: 1,
  },
  adLabelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sponsorLabel: {
    fontSize: 10,
    color: '#BDC3C7',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledCloseButton: {
    backgroundColor: '#7F8C8D',
  },
  countdownText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  adContent: {
    position: 'relative',
  },
  videoContainer: {
    position: 'relative',
    height: 250,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  adMainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  imageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  imageDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});