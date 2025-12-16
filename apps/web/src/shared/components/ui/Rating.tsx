import { forwardRef } from 'react';
import { Star } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const ratingVariants = cva(
  'inline-flex items-center gap-0.5',
  {
    variants: {
      size: {
        xs: '[&_svg]:h-3 [&_svg]:w-3',
        sm: '[&_svg]:h-4 [&_svg]:w-4',
        md: '[&_svg]:h-5 [&_svg]:w-5',
        lg: '[&_svg]:h-6 [&_svg]:w-6',
        xl: '[&_svg]:h-7 [&_svg]:w-7',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof ratingVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  readonly?: boolean;
  onValueChange?: (value: number) => void;
}

const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      size,
      value,
      max = 5,
      showValue = false,
      showCount = false,
      count,
      readonly = true,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;

    for (let i = 1; i <= max; i++) {
      if (i <= fullStars) {
        // Full star
        stars.push(
          <Star
            key={i}
            className={cn(
              'fill-golden-400 text-golden-400',
              !readonly && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => !readonly && onValueChange?.(i)}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        // Half star
        stars.push(
          <div key={i} className="relative">
            <Star className="text-gray-200" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="fill-golden-400 text-golden-400" />
            </div>
          </div>
        );
      } else {
        // Empty star
        stars.push(
          <Star
            key={i}
            className={cn(
              'text-gray-200',
              !readonly && 'cursor-pointer hover:text-golden-300 transition-colors'
            )}
            onClick={() => !readonly && onValueChange?.(i)}
          />
        );
      }
    }

    return (
      <div
        ref={ref}
        className={cn(ratingVariants({ size }), 'items-center', className)}
        {...props}
      >
        {stars}
        {showValue && (
          <span className="ml-1.5 font-medium text-gray-900">
            {value.toFixed(1)}
          </span>
        )}
        {showCount && count !== undefined && (
          <span className="ml-1 text-gray-500">
            ({count.toLocaleString()})
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = 'Rating';

// Rating Badge - compact display with golden background
const ratingBadgeVariants = cva(
  [
    'inline-flex items-center gap-1 font-medium',
    'bg-golden-50 text-golden-700',
    'rounded-lg',
  ],
  {
    variants: {
      size: {
        sm: 'px-1.5 py-0.5 text-xs [&_svg]:h-3 [&_svg]:w-3',
        md: 'px-2 py-1 text-sm [&_svg]:h-4 [&_svg]:w-4',
        lg: 'px-2.5 py-1.5 text-base [&_svg]:h-5 [&_svg]:w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface RatingBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ratingBadgeVariants> {
  value: number;
  showCount?: boolean;
  count?: number;
}

const RatingBadge = forwardRef<HTMLDivElement, RatingBadgeProps>(
  ({ className, size, value, showCount, count, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(ratingBadgeVariants({ size }), className)}
      {...props}
    >
      <Star className="fill-golden-500 text-golden-500" />
      <span>{value.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-golden-600/70">({count})</span>
      )}
    </div>
  )
);

RatingBadge.displayName = 'RatingBadge';

// Simple Star Rating Display - just the stars inline
interface StarRatingProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const StarRating = ({ rating, size = 'sm', className }: StarRatingProps) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? 'fill-golden-400 text-golden-400'
              : 'text-gray-200'
          )}
        />
      ))}
    </div>
  );
};

// Compact Rating - just number and one star
interface CompactRatingProps {
  value: number;
  className?: string;
}

const CompactRating = ({ value, className }: CompactRatingProps) => (
  <div className={cn('inline-flex items-center gap-1', className)}>
    <Star className="h-4 w-4 fill-golden-400 text-golden-400" />
    <span className="font-medium text-gray-900">{value.toFixed(1)}</span>
  </div>
);

export { Rating, RatingBadge, StarRating, CompactRating, ratingVariants, ratingBadgeVariants };
