// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'underlined' | 'filled' | 'outlined';
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, variant = 'underlined', className = '', containerClassName = '', ...props }, ref) => {
    const baseClasses = 'block w-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      underlined: `border-0 border-b ${error ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-0 pb-2`,
      filled: `border-0 bg-muted rounded-md ${error ? 'border-destructive' : ''} focus:bg-background focus:ring-2 focus:ring-ring py-3 px-4`,
      outlined: `border ${error ? 'border-destructive' : 'border-border'} rounded-md focus:border-primary focus:ring-2 focus:ring-ring py-3 px-4`,
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label           className={`block text-xs font-medium ${error ? 'text-destructive' : 'text-muted-foreground'} mb-1.5`}>
            {label}
          </label>
        )}
        <input ref={ref} className={classes} {...props} />
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
