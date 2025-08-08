import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value = '',
  placeholder = 'Select...',
  className,
  disabled = false,
  onChange,
  onFocus,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [displayValue, setDisplayValue] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setDisplayValue(selectedOption?.label || '');
    setSearchTerm('');
  }, [value, options]);

  // Fuzzy search function
  const fuzzyMatch = (text: string, search: string): number => {
    if (!search) return 1;
    
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower === searchLower) return 1000;
    
    // Starts with search gets high score
    if (textLower.startsWith(searchLower)) return 500;
    
    // Contains search gets medium score
    if (textLower.includes(searchLower)) return 100;
    
    // Fuzzy match - check if all characters exist in order
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    
    return searchIndex === searchLower.length ? 10 : 0;
  };

  // Filter and sort options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    return options
      .map(option => ({
        ...option,
        score: fuzzyMatch(option.label, searchTerm)
      }))
      .filter(option => option.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [options, searchTerm]);

  // Get best match (first in filtered list)
  const bestMatch = filteredOptions[0];

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    setSearchTerm(displayValue);
    setHighlightedIndex(0);
    onFocus?.();
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on an option
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
      onBlur?.();
    }, 100);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(0);
  };

  // Handle option selection
  const selectOption = (option: Option) => {
    onChange?.(option.value);
    setDisplayValue(option.label);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setSearchTerm(displayValue);
        setHighlightedIndex(0);
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
      case 'Tab':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        } else if (bestMatch && e.key === 'Enter') {
          // Select best match on Enter if no specific option is highlighted
          selectOption(bestMatch);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Group options by their group property
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: Option[] } = {};
    
    filteredOptions.forEach(option => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
    });
    
    return groups;
  }, [filteredOptions]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-md bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          isOpen && "ring-2 ring-primary border-transparent"
        )}
        autoComplete="off"
      />
      
      {/* Dropdown Arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg 
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            <ul ref={listRef} className="py-1">
              {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <React.Fragment key={groupName}>
                  {/* Group Header */}
                  {groupName !== 'default' && (
                    <li className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                      {groupName}
                    </li>
                  )}
                  
                  {/* Group Options */}
                  {groupOptions.map((option, _index) => {
                    const globalIndex = filteredOptions.findIndex(opt => opt === option);
                    const isHighlighted = highlightedIndex === globalIndex;
                    const isSelected = value === option.value;
                    
                    return (
                      <li
                        key={option.value}
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer transition-colors",
                          "hover:bg-blue-50",
                          isHighlighted && "bg-blue-100",
                          isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                          isSelected && isHighlighted && "bg-blue-700"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectOption(option);
                        }}
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                      >
                        {/* Highlight matching text */}
                        {searchTerm ? (
                          <HighlightedText text={option.label} search={searchTerm} />
                        ) : (
                          option.label
                        )}
                        
                        {/* Best match indicator */}
                        {option === bestMatch && searchTerm && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">
                            ⭐ Best match
                          </span>
                        )}
                      </li>
                    );
                  })}
                </React.Fragment>
              ))}
            </ul>
          )}
          
          {/* Search hint */}
          {searchTerm && bestMatch && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
              Press <kbd className="px-1 bg-gray-200 rounded">Enter</kbd> to select "{bestMatch.label}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component to highlight matching text
const HighlightedText: React.FC<{ text: string; search: string }> = ({ text, search }) => {
  if (!search) return <>{text}</>;
  
  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-0 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};