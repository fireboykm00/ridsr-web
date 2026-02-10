// src/components/ui/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`block w-full text-base text-gray-900 placeholder-gray-500 border-0 border-b ${error ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:ring-0 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export default Select;