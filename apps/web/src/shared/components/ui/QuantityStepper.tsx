import { forwardRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const quantityStepperVariants = cva(
  'inline-flex items-center',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 rounded-xl',
        outlined: 'border border-gray-200 rounded-xl',
        filled: 'bg-brand-50 rounded-xl',
      },
      size: {
        sm: 'h-8 gap-1',
        md: 'h-10 gap-2',
        lg: 'h-12 gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const buttonVariants = cva(
  [
    'flex items-center justify-center',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        outlined: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        filled: 'text-brand-600 hover:bg-brand-100 hover:text-brand-700',
      },
      size: {
        sm: 'w-7 h-7 rounded-lg [&_svg]:h-3 [&_svg]:w-3',
        md: 'w-9 h-9 rounded-lg [&_svg]:h-4 [&_svg]:w-4',
        lg: 'w-11 h-11 rounded-xl [&_svg]:h-5 [&_svg]:w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface QuantityStepperProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof quantityStepperVariants> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const QuantityStepper = forwardRef<HTMLDivElement, QuantityStepperProps>(
  (
    {
      className,
      variant,
      size,
      value,
      onChange,
      min = 0,
      max = 99,
      step = 1,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const handleDecrement = () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    };

    const handleIncrement = () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    };

    const displaySizes = {
      sm: 'w-7 text-sm',
      md: 'w-9 text-base',
      lg: 'w-11 text-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(quantityStepperVariants({ variant, size }), className)}
        {...props}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(buttonVariants({ variant, size }))}
          aria-label="Decrease quantity"
        >
          <Minus />
        </button>
        <span
          className={cn(
            'font-medium text-center tabular-nums text-gray-900',
            displaySizes[size || 'md']
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(buttonVariants({ variant, size }))}
          aria-label="Increase quantity"
        >
          <Plus />
        </button>
      </div>
    );
  }
);

QuantityStepper.displayName = 'QuantityStepper';

// Compact version for inline use
const CompactQuantityStepper = forwardRef<HTMLDivElement, QuantityStepperProps>(
  ({ className, value, onChange, min = 0, max = 99, disabled = false, ...props }, ref) => (
    <div ref={ref} className={cn('inline-flex items-center gap-2', className)} {...props}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center font-medium text-gray-900 tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
);

CompactQuantityStepper.displayName = 'CompactQuantityStepper';

// Add to cart button with quantity
interface AddToCartQuantityProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  isInCart?: boolean;
  disabled?: boolean;
  className?: string;
}

const AddToCartQuantity = ({
  quantity,
  onQuantityChange,
  onAddToCart,
  isInCart = false,
  disabled = false,
  className,
}: AddToCartQuantityProps) => {
  if (isInCart && quantity > 0) {
    return (
      <QuantityStepper
        variant="filled"
        size="sm"
        value={quantity}
        onChange={onQuantityChange}
        min={0}
        disabled={disabled}
        className={className}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onAddToCart}
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center',
        'rounded-xl bg-brand-500 text-white',
        'hover:bg-brand-600 active:scale-95',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label="Add to cart"
    >
      <Plus className="h-5 w-5" />
    </button>
  );
};

export { QuantityStepper, CompactQuantityStepper, AddToCartQuantity, quantityStepperVariants };
