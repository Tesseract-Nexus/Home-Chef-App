import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center',
    'font-medium whitespace-nowrap',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        // Default gray
        default: 'bg-gray-100 text-gray-700',
        // Brand orange
        brand: 'bg-brand-100 text-brand-700',
        // Success green
        success: 'bg-fresh-100 text-fresh-700',
        // Warning yellow/golden
        warning: 'bg-golden-100 text-golden-700',
        // Error red
        error: 'bg-red-100 text-red-700',
        // Info blue
        info: 'bg-blue-100 text-blue-700',
        // Premium golden
        premium: 'bg-gradient-to-r from-golden-100 to-golden-200 text-golden-800',
        // Outlined variants
        'outline-default': 'border border-gray-200 text-gray-700 bg-transparent',
        'outline-brand': 'border border-brand-300 text-brand-600 bg-transparent',
        'outline-success': 'border border-fresh-300 text-fresh-600 bg-transparent',
        // Solid variants
        'solid-brand': 'bg-brand-500 text-white',
        'solid-success': 'bg-fresh-500 text-white',
        'solid-error': 'bg-red-500 text-white',
      },
      size: {
        sm: 'h-5 px-2 text-[10px] rounded-full',
        md: 'h-6 px-2.5 text-xs rounded-full',
        lg: 'h-7 px-3 text-sm rounded-full',
      },
      dot: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Add left margin for dot when present
      {
        dot: true,
        className: 'pl-1.5',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, dotColor, children, ...props }, ref) => {
    // Determine dot color based on variant
    const getDotColorClass = () => {
      if (dotColor) return dotColor;
      switch (variant) {
        case 'success':
        case 'outline-success':
        case 'solid-success':
          return 'bg-fresh-500';
        case 'error':
        case 'solid-error':
          return 'bg-red-500';
        case 'warning':
          return 'bg-golden-500';
        case 'brand':
        case 'outline-brand':
        case 'solid-brand':
          return 'bg-brand-500';
        case 'info':
          return 'bg-blue-500';
        default:
          return 'bg-gray-500';
      }
    };

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {dot && (
          <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', getDotColorClass())} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge - pre-configured badges for common statuses
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, children, ...props }, ref) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active', dot: true },
      inactive: { variant: 'default' as const, label: 'Inactive', dot: true },
      pending: { variant: 'warning' as const, label: 'Pending', dot: true },
      success: { variant: 'success' as const, label: 'Success', dot: false },
      error: { variant: 'error' as const, label: 'Error', dot: false },
      warning: { variant: 'warning' as const, label: 'Warning', dot: false },
    };

    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot={config.dot}
        {...props}
      >
        {children || config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Order Status Badge
export interface OrderStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

const OrderStatusBadge = forwardRef<HTMLSpanElement, OrderStatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
      pending: { variant: 'warning', label: 'New' },
      accepted: { variant: 'info', label: 'Accepted' },
      preparing: { variant: 'brand', label: 'Preparing' },
      ready: { variant: 'success', label: 'Ready' },
      picked_up: { variant: 'info', label: 'Picked Up' },
      delivering: { variant: 'brand', label: 'Delivering' },
      delivered: { variant: 'default', label: 'Delivered' },
      cancelled: { variant: 'error', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { variant: 'default', label: status };

    return (
      <Badge ref={ref} variant={config.variant} {...props}>
        {config.label}
      </Badge>
    );
  }
);

OrderStatusBadge.displayName = 'OrderStatusBadge';

export { Badge, StatusBadge, OrderStatusBadge, badgeVariants };
