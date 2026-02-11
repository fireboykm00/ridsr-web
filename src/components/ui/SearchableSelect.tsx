'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  variant?: 'underlined' | 'filled' | 'outlined';
  containerClassName?: string;
  onChange?: (value: string) => void;
  value?: string;
}

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
  ({ label, error, helperText, options, variant = 'outlined', containerClassName = '', onChange, value, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState(value || '');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || 'Select...';

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      setSelectedValue(value || '');
    }, [value]);

    const variantClasses = {
      underlined: `border-0 border-b ${error ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:ring-0 pb-2`,
      filled: `border-0 bg-gray-50 rounded-lg ${error ? 'border-red-500' : ''} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`,
      outlined: `border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`
    };

    return (
      <div ref={ref} className={`w-full ${containerClassName}`}>
        {label && (
          <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full text-left flex items-center justify-between ${variantClasses[variant]} text-base text-gray-900 focus:outline-none`}
          >
            <span>{selectedLabel}</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                autoFocus
              />
              <ul className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">No options found</li>
                ) : (
                  filteredOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                          selectedValue === option.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
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

SearchableSelect.displayName = 'SearchableSelect';

export { SearchableSelect };
