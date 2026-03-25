// src/components/ui/Badge.tsx
import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'error' | 'destructive';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: 'full' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', rounded = 'full', className = '', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-muted text-muted-foreground',
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-muted text-foreground',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-accent/20 text-accent-foreground',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-primary/10 text-primary',
      error: 'bg-red-100 text-red-800',
      destructive: 'bg-red-100 text-red-800',
    };

    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-0.5',
      lg: 'text-sm px-3 py-1',
    };

    const roundedClasses = {
      full: 'rounded-full',
      md: 'rounded-md',
      lg: 'rounded-lg',
    };

    const classes = `inline-flex items-center font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`;

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
