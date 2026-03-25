// src/components/ui/Button.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline' | 'destructive' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed select-none';

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-sm px-6 py-3',
    };

    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
      secondary: 'bg-transparent border border-primary text-primary hover:bg-primary/5 disabled:opacity-50',
      tertiary: 'text-muted-foreground hover:bg-muted disabled:opacity-50',
      ghost: 'text-muted-foreground hover:bg-muted disabled:opacity-50',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 focus:ring-destructive',
      outline: 'border border-border text-foreground hover:bg-muted disabled:opacity-50',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 focus:ring-destructive',
      success: 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 focus:ring-green-500',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
