import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, X, Camera, Send } from 'lucide-react-native';
import { useReviews } from '@/hooks/useReviews';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  chefId: string;
  chefName: string;
  orderId?: string;
  dishName?: string;
  existingReview?: any;
}

const REVIEW_PROMPTS = [
  "How was the taste?",
  "Was the food fresh?",
  "How was the packaging?",
  "Would you recommend this chef?",
  "How was the delivery time?",
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  chefId,
  chefName,
  orderId,
  dishName,
  existingReview
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReview, updateReview } = useReviews();

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters in your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview(existingReview.id, {
          rating,
          reviewText: reviewText.trim(),
        });
      } else {
        await addReview({
          chefId,
          chefName,
          orderId,
          dishName,
          rating,
          reviewText: reviewText.trim(),
        });
      }
      
      Alert.alert(
        'Review Submitted!', 
        'Thank you for your feedback. It helps other customers make better choices.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(existingReview?.rating || 0);
    setReviewText(existingReview?.reviewText || '');
    onClose();
  };

  const addPromptToReview = (prompt: string) => {
    const currentText = reviewText.trim();
    const newText = currentText ? `${currentText}\n\n${prompt} ` : `${prompt} `;
    setReviewText(newText);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Chef Info */}
          <View style={styles.chefSection}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg' }} 
              style={styles.chefImage}
            />
            <View style={styles.chefInfo}>
              <Text style={styles.chefName}>{chefName}</Text>
              {dishName && <Text style={styles.dishName}>{dishName}</Text>}
              {orderId && <Text style={styles.orderId}>Order #{orderId}</Text>}
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>How would you rate your experience?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={40}
                    color={star <= rating ? "#FFD700" : "#E0E0E0"}
                    fill={star <= rating ? "#FFD700" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && "Poor - Not satisfied"}
                {rating === 2 && "Fair - Below expectations"}
                {rating === 3 && "Good - Met expectations"}
                {rating === 4 && "Very Good - Exceeded expectations"}
                {rating === 5 && "Excellent - Outstanding!"}
              </Text>
            )}
          </View>

          {/* Review Prompts */}
          <View style={styles.promptsSection}>
            <Text style={styles.sectionTitle}>Quick review prompts:</Text>
            <View style={styles.promptsContainer}>
              {REVIEW_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptChip}
                  onPress={() => addPromptToReview(prompt)}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review Text */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Share your experience</Text>
            <TextInput
              style={styles.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Tell others about your experience with this chef's food. What did you like? What could be improved?"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {reviewText.length}/500 characters
            </Text>
          </View>

          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Add photos (optional)</Text>
            <TouchableOpacity style={styles.photoUpload}>
              <Camera size={24} color="#7F8C8D" />
              <Text style={styles.photoUploadText}>Add photos of your food</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, (rating === 0 || isSubmitting) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chefSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  chefImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  dishName: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    textAlign: 'center',
  },
  promptsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  promptText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 120,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  photoUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 8,
  },
  photoUploadText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});