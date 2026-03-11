'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SearchableSelectProps<T = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
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
  showAllOption?: boolean;
  allOptionLabel?: string;
  showSearchOnOpen?: boolean;
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
  showAllOption = false,
  allOptionLabel = 'All',
  showSearchOnOpen = false,
}: SearchableSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption<T>[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const loadOptions = useCallback(async (query: string) => {
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
  }, [onSearch, options]);

  useEffect(() => {
    if (isOpen && showSearchOnOpen && onSearch) {
      loadOptions('');
    }
  }, [isOpen, showSearchOnOpen, onSearch, loadOptions]);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    await loadOptions(query);
  };

  const handleSelect = (optionValue: T) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    } else {
      setIsOpen(true);
      if (showSearchOnOpen && onSearch) {
        loadOptions('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        if (showSearchOnOpen && onSearch) {
          loadOptions('');
        }
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

  const getOptionKey = (option: SelectOption<T>, index: number): string => {
    if (option.value !== undefined && option.value !== null) {
      return String(option.value);
    }
    return `option-${index}`;
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
          <div
            role="combobox"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={`w-full text-left flex items-center justify-between cursor-pointer ${variantClasses[variant]} text-base text-gray-900 focus:outline-none`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="searchable-select-listbox"
            tabIndex={0}
          >
            <span className={value ? 'text-gray-900 truncate' : 'text-gray-500'}>
              {displayValue}
            </span>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {isClearable && value && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </span>
              )}
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
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
            <ul id="searchable-select-listbox" className="max-h-60 overflow-y-auto" role="listbox">
              {isLoading ? (
                <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
              ) : filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">No options found</li>
              ) : (
                <>
                  {showAllOption && (
                    <li key="__all__">
                      <button
                        type="button"
                        onClick={() => handleSelect('__all__' as T)}
                        className={`w-full text-left px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border-b border-gray-100`}
                      >
                        {allOptionLabel}
                      </button>
                    </li>
                  )}
                  {filteredOptions.map((option, index) => (
                    <li key={getOptionKey(option, index)} role="option" aria-selected={value === option.value}>
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
                  ))}
                </>
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
