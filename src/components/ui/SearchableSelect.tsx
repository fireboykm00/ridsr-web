'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SelectOption<T = string> {
  value: T;
  label: string;
  [key: string]: unknown;
}

interface SearchableSelectProps<T = string> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption<T>[];
  containerClassName?: string;
  onChange?: (value: T | null) => void;
  value?: T | null;
  onSearch?: (query: string) => Promise<SelectOption<T>[]> | SelectOption<T>[];
  isLoading?: boolean;
  isClearable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  debounceMs?: number;
  minSearchLength?: number;
}

const SearchableSelect = <T = string,>({
  label,
  error,
  helperText,
  options = [],
  containerClassName = '',
  onChange,
  value,
  onSearch,
  isLoading = false,
  isClearable = false,
  placeholder = 'Select...',
  disabled = false,
  searchPlaceholder = 'Search...',
  debounceMs = 300,
  minSearchLength = 0,
}: SearchableSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayOptions, setDisplayOptions] = useState<SelectOption<T>[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const foundOption = options.find(opt => opt.value === value) || displayOptions.find(opt => opt.value === value);
  const selectedOption = foundOption ? foundOption.label : (value ? selectedLabel : '');

  const performSearch = useCallback(async (query: string) => {
    if (onSearch) {
      setIsSearching(true);
      try {
        const results = await onSearch(query);
        setDisplayOptions(results || []);
      } catch (error) {
        console.error('Search error:', error);
        setDisplayOptions([]);
      } finally {
        setIsSearching(false);
      }
    } else if (!query.trim()) {
      setDisplayOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [onSearch, options]);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    
    if (onSearch) {
      setDisplayOptions([]);
      Promise.resolve(onSearch('')).then((results: SelectOption<T>[]) => {
        setDisplayOptions(results || []);
      }).catch(() => {
        setDisplayOptions([]);
      });
    } else {
      setDisplayOptions(options);
    }
  }, [onSearch, options]);

  const handleToggle = () => {
    if (disabled) return;
    
    if (isOpen) {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    } else {
      handleOpen();
    }
  };

  const handleSelect = (optionValue: T) => {
    const option = displayOptions.find(opt => opt.value === optionValue);
    if (option) {
      setSelectedLabel(option.label);
    }
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    setSelectedLabel('');
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    
    if (onSearch) {
      if (minSearchLength > 0 && query.length < minSearchLength) {
        return;
      }
      debouncedSearch(query);
    } else {
      if (!query.trim()) {
        setDisplayOptions(options);
      } else {
        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(query.toLowerCase())
        );
        setDisplayOptions(filtered);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    const currentOptions = displayOptions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < currentOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : currentOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && currentOptions[highlightedIndex]) {
          handleSelect(currentOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case 'Backspace':
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!onSearch) {
      setDisplayOptions(options);
    }
  }, [options, onSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (value && !selectedLabel) {
      const found = options.find(opt => opt.value === value);
      if (found) {
        setSelectedLabel(found.label);
      }
    }
  }, [value, options, selectedLabel]);

  const variantClasses = `
    border rounded-lg focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 
    py-3 px-4 transition-colors duration-150
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
  `;

  const dropdownContent = () => {
    if (isLoading || isSearching) {
      return (
        <div className="px-3 py-4 text-sm text-gray-500 flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      );
    }

    if (displayOptions.length === 0) {
      const message = onSearch 
        ? (searchTerm.length > 0 ? 'No results found' : 'Start typing to search...')
        : 'No options available';
      return <div className="px-3 py-2 text-sm text-gray-500">{message}</div>;
    }

    return displayOptions.map((option, index) => (
      <div
        key={String(option.value)}
        role="option"
        aria-selected={value === option.value}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSelect(option.value);
        }}
        className={`
          w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-100
          ${index === highlightedIndex ? 'bg-blue-50 text-blue-900' : ''}
          ${value === option.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-900 hover:bg-gray-50'}
        `}
      >
        {option.label}
      </div>
    ));
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-2`}>
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <div
          role="combobox"
          onClick={handleToggle}
          onKeyDown={disabled ? undefined : handleKeyDown}
          className={`${variantClasses} cursor-pointer flex items-center justify-between`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="select-listbox"
          tabIndex={0}
        >
          <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption || placeholder}
          </span>
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {isClearable && value && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange?.(null);
                    setSelectedLabel('');
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                  }
                }}
              >
                <XMarkIcon className="h-4 w-4 text-gray-400" />
              </span>
            )}
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {onSearch && (
              <div className="relative border-b border-gray-200">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full pl-9 pr-3 py-2.5 text-sm focus:outline-none"
                  autoComplete="off"
                />
              </div>
            )}
            <div id="select-listbox" className="max-h-60 overflow-y-auto" role="listbox">
              {dropdownContent()}
            </div>
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
