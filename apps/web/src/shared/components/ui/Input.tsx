import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const inputVariants = cva(
  // Base styles
  [
    'w-full',
    'text-gray-900 placeholder:text-gray-400',
    'transition-all duration-200 ease-premium',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ],
  {
    variants: {
      variant: {
        // Default - bordered input
        default: [
          'border border-gray-200 bg-white',
          'hover:border-gray-300',
          'focus:border-brand-500 focus:ring-brand-500/20',
        ],
        // Filled - gray background
        filled: [
          'border-transparent bg-gray-100',
          'hover:bg-gray-50',
          'focus:bg-white focus:border-brand-500 focus:ring-brand-500/20',
        ],
        // Flushed - only bottom border
        flushed: [
          'border-0 border-b-2 border-gray-200 rounded-none bg-transparent px-0',
          'hover:border-gray-300',
          'focus:border-brand-500 focus:ring-0',
        ],
        // Ghost - no border until focus
        ghost: [
          'border-transparent bg-transparent',
          'hover:bg-gray-50',
          'focus:bg-white focus:border-brand-500 focus:ring-brand-500/20',
        ],
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-4 text-base rounded-lg',
        xl: 'h-12 px-5 text-base rounded-xl',
      },
      hasError: {
        true: [
          'border-red-500 text-red-900',
          'focus:border-red-500 focus:ring-red-500/20',
          'placeholder:text-red-300',
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      hasError: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      hasError,
      leftIcon,
      rightIcon,
      error,
      label,
      hint,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const showError = error || hasError;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              inputVariants({ variant, inputSize, hasError: !!showError }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
const textareaVariants = cva(
  [
    'w-full min-h-[80px] resize-y',
    'text-gray-900 placeholder:text-gray-400',
    'transition-all duration-200 ease-premium',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border border-gray-200 bg-white',
          'hover:border-gray-300',
          'focus:border-brand-500 focus:ring-brand-500/20',
        ],
        filled: [
          'border-transparent bg-gray-100',
          'hover:bg-gray-50',
          'focus:bg-white focus:border-brand-500 focus:ring-brand-500/20',
        ],
      },
      hasError: {
        true: [
          'border-red-500',
          'focus:border-red-500 focus:ring-red-500/20',
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hasError: false,
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  label?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, hasError, error, label, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const showError = error || hasError;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            textareaVariants({ variant, hasError: !!showError }),
            'p-4 rounded-lg',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants, textareaVariants };
