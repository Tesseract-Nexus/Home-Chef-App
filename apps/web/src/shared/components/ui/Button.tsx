import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200 ease-premium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        // Primary - Brand orange, filled
        primary: [
          'bg-brand-500 text-white',
          'hover:bg-brand-600',
          'focus-visible:ring-brand-500',
          'shadow-sm hover:shadow-md',
        ],
        // Secondary - Subtle gray background
        secondary: [
          'bg-gray-100 text-gray-900',
          'hover:bg-gray-200',
          'focus-visible:ring-gray-500',
        ],
        // Outline - Bordered
        outline: [
          'border-2 border-gray-200 bg-transparent text-gray-700',
          'hover:bg-gray-50 hover:border-gray-300',
          'focus-visible:ring-gray-500',
        ],
        // Ghost - No background until hover
        ghost: [
          'text-gray-700',
          'hover:bg-gray-100',
          'focus-visible:ring-gray-500',
        ],
        // Danger - Red for destructive actions
        danger: [
          'bg-red-500 text-white',
          'hover:bg-red-600',
          'focus-visible:ring-red-500',
          'shadow-sm hover:shadow-md',
        ],
        // Premium - Golden gradient for special CTAs
        premium: [
          'bg-gradient-to-r from-golden-500 to-golden-600 text-white',
          'hover:from-golden-600 hover:to-golden-700',
          'focus-visible:ring-golden-500',
          'shadow-sm hover:shadow-glow-golden',
        ],
        // Brand outline - Brand colored border
        'brand-outline': [
          'border-2 border-brand-500 bg-transparent text-brand-600',
          'hover:bg-brand-50',
          'focus-visible:ring-brand-500',
        ],
        // Success - Green for confirmations
        success: [
          'bg-fresh-500 text-white',
          'hover:bg-fresh-600',
          'focus-visible:ring-fresh-500',
          'shadow-sm hover:shadow-md',
        ],
        // Link style
        link: [
          'text-brand-600 underline-offset-4',
          'hover:underline',
          'focus-visible:ring-brand-500',
          'p-0 h-auto',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-lg',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-5 text-base rounded-xl',
        xl: 'h-12 px-6 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
