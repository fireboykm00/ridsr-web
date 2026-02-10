// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'underlined' | 'filled' | 'outlined';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, variant = 'underlined', className = '', ...props }, ref) => {
    const baseClasses = 'block w-full text-base text-gray-900 placeholder-gray-500 focus:outline-none';
    
    const variantClasses = {
      underlined: `border-0 border-b ${error ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:ring-0 pb-2`,
      filled: `border-0 bg-gray-50 rounded-lg ${error ? 'border-red-500' : ''} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`,
      outlined: `border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`
    };
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={classes}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;