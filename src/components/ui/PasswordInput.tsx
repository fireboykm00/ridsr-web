// src/components/ui/PasswordInput.tsx
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Input from './Input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'underlined' | 'filled' | 'outlined';
  containerClassName?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, variant = 'underlined', containerClassName = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className="pr-10"
            error={error}
            helperText={helperText}
            variant={variant}
            {...props}
            ref={ref}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;