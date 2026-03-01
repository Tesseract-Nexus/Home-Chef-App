import { forwardRef } from 'react';
import {
  Select as DSSelect,
  SelectGroup as DSSelectGroup,
  SelectValue as DSSelectValue,
  SelectTrigger as DSSelectTrigger,
  SelectContent as DSSelectContent,
  SelectLabel as DSSelectLabel,
  SelectItem as DSSelectItem,
  SelectSeparator as DSSelectSeparator,
  SelectScrollUpButton as DSSelectScrollUpButton,
  SelectScrollDownButton as DSSelectScrollDownButton,
} from '@tesserix/web';
import { cn } from '@tesserix/web';
import { cva, type VariantProps } from 'class-variance-authority';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

// Re-export DS primitives
const Select = DSSelect;
const SelectGroup = DSSelectGroup;
const SelectValue = DSSelectValue;
const SelectContent = DSSelectContent;
const SelectLabel = DSSelectLabel;
const SelectItem = DSSelectItem;
const SelectSeparator = DSSelectSeparator;
const SelectScrollUpButton = DSSelectScrollUpButton;
const SelectScrollDownButton = DSSelectScrollDownButton;

// Extended trigger with variant/size/hasError (DS trigger may not have these)
const selectTriggerVariants = cva(
  [
    'flex items-center justify-between gap-2',
    'w-full',
    'text-foreground placeholder:text-muted-foreground',
    'transition-all duration-200 ease-premium',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    '[&>span]:truncate',
  ],
  {
    variants: {
      variant: {
        default: [
          'border border-input bg-background',
          'hover:border-primary/30',
          'focus:border-primary focus:ring-ring/20',
        ],
        filled: [
          'border-transparent bg-secondary',
          'hover:bg-secondary/80',
          'focus:bg-background focus:border-primary focus:ring-ring/20',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-4 text-base rounded-xl',
      },
      hasError: {
        true: 'border-destructive focus:border-destructive focus:ring-destructive/20',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hasError: false,
    },
  }
);

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, variant, size, hasError, children, ...props }, ref) => {
  // For default variant without hasError, try DS trigger
  if (!variant && !size && !hasError) {
    return (
      <DSSelectTrigger ref={ref} className={className} {...props}>
        {children}
      </DSSelectTrigger>
    );
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(selectTriggerVariants({ variant, size, hasError }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// Wrapper component
interface SimpleSelectProps
  extends VariantProps<typeof selectTriggerVariants> {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

function SimpleSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  label,
  error,
  variant,
  size,
  disabled,
  className,
}: SimpleSelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger variant={variant} size={size} hasError={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SimpleSelect,
  selectTriggerVariants,
};
