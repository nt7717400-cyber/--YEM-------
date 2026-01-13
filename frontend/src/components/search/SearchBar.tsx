'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchSuggestion {
  type: 'car' | 'brand' | 'category';
  label: string;
  value: string;
}

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  suggestions?: SearchSuggestion[];
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  onQueryChange?: (query: string) => void;
}

/**
 * Filters suggestions based on query string.
 * Returns suggestions that contain the query (case-insensitive) in their label or value.
 */
export function filterSuggestions(
  suggestions: SearchSuggestion[],
  query: string
): SearchSuggestion[] {
  if (!query || query.trim() === '') {
    return [];
  }
  const normalizedQuery = query.toLowerCase().trim();
  return suggestions.filter(
    (suggestion) =>
      suggestion.label.toLowerCase().includes(normalizedQuery) ||
      suggestion.value.toLowerCase().includes(normalizedQuery)
  );
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'ابحث عن سيارة...',
  className = '',
  suggestions = [],
  onSearch,
  isLoading = false,
  onQueryChange,
}: SearchBarProps) {
  const [search, setSearch] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current search query
  const filteredSuggestions = filterSuggestions(suggestions, search);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent of query changes for fetching suggestions
  useEffect(() => {
    onQueryChange?.(search);
  }, [search, onQueryChange]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);
      
      if (onSearch) {
        onSearch(search.trim());
      } else {
        const params = new URLSearchParams();
        if (search.trim()) {
          params.set('search', search.trim());
        }
        router.push(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
      }
    },
    [search, onSearch, router]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      setSearch(suggestion.value);
      setShowSuggestions(false);
      
      if (onSearch) {
        onSearch(suggestion.value);
      } else {
        const params = new URLSearchParams();
        params.set('search', suggestion.value);
        router.push(`/cars?${params.toString()}`);
      }
    },
    [onSearch, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
            e.preventDefault();
            handleSuggestionClick(filteredSuggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showSuggestions, filteredSuggestions, selectedIndex, handleSuggestionClick]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(value.trim().length > 0);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (search.trim().length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'car':
        return <CarIcon className="h-4 w-4 text-muted-foreground" />;
      case 'brand':
        return <TagIcon className="h-4 w-4 text-muted-foreground" />;
      case 'category':
        return <FolderIcon className="h-4 w-4 text-muted-foreground" />;
      default:
        return <SearchIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={search}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 pr-10"
            aria-label="البحث"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          {isLoading && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <LoadingSpinner className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button type="submit" disabled={isLoading}>
          <SearchIcon className="h-4 w-4 ml-2" />
          بحث
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg"
          role="listbox"
          aria-label="اقتراحات البحث"
        >
          <ul className="max-h-60 overflow-auto py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex flex-col">
                  <span className="font-medium">{suggestion.label}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {suggestion.type === 'car'
                      ? 'سيارة'
                      : suggestion.type === 'brand'
                      ? 'ماركة'
                      : 'فئة'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 17h.01M16 17h.01M9 11h6M5 11l2-5h10l2 5M5 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-6M5 11H3m18 0h-2"
      />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
