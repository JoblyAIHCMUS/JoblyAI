'use client';

import * as React from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocationAutocomplete } from '@/api-hook/location/useLocationAutocomplete';
import { LocationDetail, getOrCreateLocation } from '@/api-client/location';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  value?: string | LocationDetail | null;
  onChange?: (location: LocationDetail | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  error?: boolean;
  hideIcon?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Select location...',
  className,
  inputClassName,
  error = false,
  hideIcon = false,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { fetchSuggestions, suggestions, loading, setSuggestions } =
    useLocationAutocomplete();
  const [debouncedValue, setDebouncedValue] = React.useState('');

  // Sync prop value to input string
  React.useEffect(() => {
    if (!value) {
      setInputValue('');
    } else if (typeof value === 'string') {
      setInputValue(value);
    } else {
      setInputValue(value.formattedAddress);
    }
  }, [value]);

  // Handle debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Query suggestions when debounced input changes
  React.useEffect(() => {
    if (isOpen && debouncedValue.trim() !== '') {
      // Don't search if the input value matches the current selected formattedAddress
      const currentFormatted =
        typeof value === 'object' && value
          ? value.formattedAddress
          : typeof value === 'string'
          ? value
          : '';
      if (debouncedValue !== currentFormatted) {
        void fetchSuggestions(debouncedValue);
      }
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue, isOpen, fetchSuggestions, value, setSuggestions]);

  // Handle click outside to close suggestion box
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (suggestion: LocationDetail) => {
    setInputValue(suggestion.formattedAddress);
    setIsOpen(false);

    if (onChange) {
      try {
        const dbLocation = await getOrCreateLocation({
          provider: suggestion.provider,
          providerId: suggestion.providerId,
          formattedAddress: suggestion.formattedAddress,
          lat: suggestion.lat,
          lng: suggestion.lng,
          city: suggestion.city,
          state: suggestion.state,
          country: suggestion.country,
          postcode: suggestion.postcode,
        });
        onChange(dbLocation);
      } catch (err) {
        console.error('Failed to create/resolve location record:', err);
        onChange(suggestion);
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'pr-10',
            !hideIcon ? 'pl-9' : 'pl-0',
            inputClassName,
            error && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        {!hideIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </div>
        )}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.providerId}
              type="button"
              onClick={() => void handleSelect(suggestion)}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 focus:outline-none transition-colors"
            >
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-slate-700">
                {suggestion.formattedAddress}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
