// src/components/ui/CustomSelect.tsx
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  variant?: 'underlined' | 'filled' | 'outlined';
  containerClassName?: string;
}

const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ label, error, helperText, options, variant = 'underlined', containerClassName = '', className = '', ...props }, ref) => {
    const baseClasses = 'block w-full text-base text-gray-900 placeholder-gray-500 focus:outline-none appearance-none pr-8';

    const variantClasses = {
      underlined: `border-0 border-b ${error ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:ring-0 pb-2`,
      filled: `border-0 bg-gray-50 rounded-lg ${error ? 'border-red-500' : ''} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`,
      outlined: `border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={classes}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
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

CustomSelect.displayName = 'CustomSelect';

export { CustomSelect };