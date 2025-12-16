import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const cardVariants = cva(
  // Base styles
  ['rounded-2xl transition-all duration-200 ease-premium'],
  {
    variants: {
      variant: {
        // Default card with subtle shadow
        default: [
          'bg-white',
          'shadow-card',
        ],
        // Elevated card with more prominent shadow
        elevated: [
          'bg-white',
          'shadow-elevated',
        ],
        // Outlined card with border
        outlined: [
          'bg-white',
          'border border-gray-200',
        ],
        // Glass effect card
        glass: [
          'bg-white/80 backdrop-blur-lg',
          'border border-white/20',
          'shadow-soft-md',
        ],
        // Premium card with gradient border
        premium: [
          'bg-white',
          'shadow-soft-lg',
          'ring-1 ring-golden-200',
        ],
        // Ghost - no background
        ghost: [
          'bg-transparent',
        ],
        // Filled gray
        filled: [
          'bg-gray-50',
        ],
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: [
          'hover:shadow-card-hover hover:-translate-y-1',
          'cursor-pointer',
        ],
        glow: [
          'hover:shadow-glow-brand',
          'cursor-pointer',
        ],
        border: [
          'hover:border-brand-300',
          'cursor-pointer',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// Card Header
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Card Image - for card with image at top
const CardImage = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { aspectRatio?: 'video' | 'square' | 'portrait' }
>(({ className, aspectRatio = 'video', children, ...props }, ref) => {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-t-2xl -mx-6 -mt-6 mb-4',
        aspectClasses[aspectRatio],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CardImage.displayName = 'CardImage';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  cardVariants,
};
