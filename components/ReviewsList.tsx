import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Star, ThumbsUp, MoveVertical as MoreVertical, Flag } from 'lucide-react-native';
import { useReviews, Review } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';

interface ReviewsListProps {
  chefId: string;
  showAll?: boolean;
  maxReviews?: number;
  isCollapsed?: boolean;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ 
  chefId, 
  showAll = false, 
  maxReviews = 3,
  isCollapsed = false
}) => {
  const { getReviewsByChef, getReviewStats, markHelpful } = useReviews();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const allReviews = getReviewsByChef(chefId);
  const stats = getReviewStats(chefId);

  // Sort reviews
  const sortedReviews = [...allReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const displayReviews = showAll ? sortedReviews : sortedReviews.slice(0, maxReviews);

  const renderStarRating = (rating: number, size: number = 14) => (
    <View style={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= rating ? "#FFD700" : "#E0E0E0"}
          fill={star <= rating ? "#FFD700" : "transparent"}
        />
      ))}
    </View>
  );

  const renderRatingDistribution = () => (
    <View style={styles.ratingDistribution}>
      {[5, 4, 3, 2, 1].map((rating) => (
        <View key={rating} style={styles.ratingRow}>
          <Text style={styles.ratingNumber}>{rating}</Text>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <View style={styles.ratingBar}>
            <View 
              style={[
                styles.ratingBarFill, 
                { 
                  width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.ratingCount}>
            {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.userImage }} style={styles.userImage} />
        <View style={styles.reviewInfo}>
          <Text style={styles.userName}>{review.userName}</Text>
          <View style={styles.reviewMeta}>
            {renderStarRating(review.rating)}
            <Text style={styles.reviewDate}>
              {review.createdAt.toLocaleDateString()}
            </Text>
          </View>
          {review.dishName && (
            <Text style={styles.dishName}>Ordered: {review.dishName}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={16} color="#7F8C8D" />
        </TouchableOpacity>
      </View>

      <Text style={styles.reviewText}>{review.reviewText}</Text>

      {review.images && review.images.length > 0 && (
        <ScrollView horizontal style={styles.reviewImages}>
          {review.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.reviewActions}>
        <TouchableOpacity 
          style={[styles.helpfulButton, review.isHelpful && styles.helpfulButtonActive]}
          onPress={() => markHelpful(review.id)}
        >
          <ThumbsUp 
            size={14} 
            color={review.isHelpful ? "#FF6B35" : "#7F8C8D"} 
            fill={review.isHelpful ? "#FF6B35" : "transparent"}
          />
          <Text style={[styles.helpfulText, review.isHelpful && styles.helpfulTextActive]}>
            Helpful ({review.helpfulCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reportButton}>
          <Flag size={14} color="#7F8C8D" />
          <Text style={styles.reportText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (allReviews.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Star size={48} color="#E0E0E0" />
        <Text style={styles.emptyStateTitle}>No reviews yet</Text>
        <Text style={styles.emptyStateText}>Be the first to review this chef!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isCollapsed && (
        <>
          {/* Rating Summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.averageRating}>
              <Text style={styles.averageRatingNumber}>{stats.averageRating}</Text>
              {renderStarRating(Math.round(stats.averageRating), 20)}
              <Text style={styles.totalReviews}>Based on {stats.totalReviews} reviews</Text>
            </View>
            {renderRatingDistribution()}
          </View>

          {/* Sort Options */}
          {showAll && (
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { key: 'newest', label: 'Newest' },
                  { key: 'oldest', label: 'Oldest' },
                  { key: 'highest', label: 'Highest Rated' },
                  { key: 'lowest', label: 'Lowest Rated' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortOption,
                      sortBy === option.key && styles.activeSortOption
                    ]}
                    onPress={() => setSortBy(option.key as typeof sortBy)}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.activeSortOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      )}

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {displayReviews.map(renderReview)}
        
        {!showAll && allReviews.length > maxReviews && (
          <TouchableOpacity style={styles.viewAllReviewsButton}>
            <Text style={styles.viewAllReviewsText}>
              View all {allReviews.length} reviews
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  ratingSummary: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  averageRating: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  starRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  ratingDistribution: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#2C3E50',
    width: 12,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  ratingCount: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 20,
    textAlign: 'right',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 15,
    fontWeight: '500',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  activeSortOption: {
    backgroundColor: '#FF6B35',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeSortOptionText: {
    color: '#FFFFFF',
  },
  reviewsList: {
    padding: 20,
  },
  reviewCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  dishName: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 20,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulButtonActive: {
    // Active state styling handled by color changes
  },
  helpfulText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  helpfulTextActive: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  viewAllReviewsButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllReviewsText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});