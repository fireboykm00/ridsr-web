// src/components/ui/Checkbox.tsx
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 text-primary focus:ring-ring accent-primary border-border rounded ${className}`}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label 
              className={`font-medium text-sm ${error ? 'text-destructive' : 'text-foreground'}`}
              htmlFor={props.id}
            >
              {label}
            </label>
          )}
          {helperText && !error && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };