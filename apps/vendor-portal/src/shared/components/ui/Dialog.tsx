import { forwardRef } from 'react';
import {
  Dialog as DSDialog,
  DialogPortal as DSDialogPortal,
  DialogOverlay as DSDialogOverlay,
  DialogClose as DSDialogClose,
  DialogTrigger as DSDialogTrigger,
  DialogContent as DSDialogContent,
  DialogHeader as DSDialogHeader,
  DialogFooter as DSDialogFooter,
  DialogTitle as DSDialogTitle,
  DialogDescription as DSDialogDescription,
} from '@tesserix/web';
import { cn } from '@tesserix/web';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

// Re-export core DS Dialog components
const Dialog = DSDialog;
const DialogTrigger = DSDialogTrigger;
const DialogPortal = DSDialogPortal;
const DialogClose = DSDialogClose;

// Overlay - use DS version
const DialogOverlay = DSDialogOverlay;

// Content - extend DS version with size + showClose props
interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = 'md', showClose = true, ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100%-2rem)]',
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full p-6',
          'border bg-card text-card-foreground shadow-modal rounded-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Header/Footer - use DS versions
const DialogHeader = DSDialogHeader;
const DialogFooter = DSDialogFooter;
const DialogTitle = DSDialogTitle;
const DialogDescription = DSDialogDescription;

// Alert Dialog - kept local (built on top of dialog primitives)
const AlertDialog = DialogPrimitive.Root;
const AlertDialogTrigger = DialogPrimitive.Trigger;

interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: 'default' | 'danger';
}

const AlertDialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, children, variant: _variant = 'default', ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-md p-6',
        'border bg-card text-card-foreground shadow-modal rounded-2xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = DialogHeader;
const AlertDialogFooter = DialogFooter;
const AlertDialogTitle = DialogTitle;
const AlertDialogDescription = DialogDescription;
const AlertDialogCancel = DialogPrimitive.Close;

const AlertDialogAction = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground',
      'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  />
));
AlertDialogAction.displayName = 'AlertDialogAction';

// Convenience wrapper
interface SimpleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

const SimpleDialog = ({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
}: SimpleDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent size={size}>
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {children}
    </DialogContent>
  </Dialog>
);

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  SimpleDialog,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};
