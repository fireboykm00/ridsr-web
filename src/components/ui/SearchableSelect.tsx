'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SearchableSelectProps<T = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption<T>[];
  variant?: 'underlined' | 'filled' | 'outlined';
  containerClassName?: string;
  onChange?: (value: T | null) => void;
  value?: T | null;
  onSearch?: (query: string) => Promise<SelectOption<T>[]> | SelectOption<T>[];
  isLoading?: boolean;
  isClearable?: boolean;
  placeholder?: string;
}

const SearchableSelect = <T = string,>({ 
  label, 
  error, 
  helperText, 
  options = [], 
  variant = 'outlined', 
  containerClassName = '', 
  onChange, 
  value, 
  onSearch,
  isLoading = false,
  isClearable = false,
  placeholder = 'Select...',
}: SearchableSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption<T>[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (onSearch) {
      try {
        const results = await onSearch(query);
        setFilteredOptions(results);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredOptions([]);
      }
    } else {
      if (!query.trim()) {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }
    setHighlightedIndex(-1);
  };

  const handleSelect = (optionValue: T) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange?.(null);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const variantClasses = {
    underlined: `border-0 border-b ${error ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:ring-0 pb-2`,
    filled: `border-0 bg-gray-50 rounded-lg ${error ? 'border-red-500' : ''} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`,
    outlined: `border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 py-3 px-4`
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <div className="w-full">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className={`w-full text-left flex items-center justify-between ${variantClasses[variant]} text-base text-gray-900 focus:outline-none`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue}
            </span>
            <div className="flex items-center space-x-1">
              {isClearable && value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
            />
            <ul className="max-h-48 overflow-y-auto" role="listbox">
              {isLoading ? (
                <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
              ) : filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">No options found</li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li key={String(option.value)} role="option" aria-selected={value === option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        index === highlightedIndex ? 'bg-blue-50' : ''
                      } ${
                        value === option.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-900'
                      } hover:bg-blue-50`}
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
};

SearchableSelect.displayName = 'SearchableSelect';

export { SearchableSelect, type SelectOption };
