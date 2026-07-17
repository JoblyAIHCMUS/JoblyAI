import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';
import { getOrCreateLocation } from '../api/location';
import { cn } from '../lib/utils';
import type { LocationDetail } from '../types/location';

interface LocationAutocompleteProps {
  value?: LocationDetail | null;
  onChange?: (location: LocationDetail | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder = 'Search for a location...',
  error = false,
  disabled = false,
  className,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [resolving, setResolving] = useState(false);
  const { fetchSuggestions, suggestions, loading, setSuggestions } =
    useLocationAutocomplete();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);

  // Sync prop value to input string
  useEffect(() => {
    if (!value) {
      setInputValue('');
    } else {
      setInputValue(value.formattedAddress);
    }
  }, [value]);

  // Debounced search-as-you-type
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = inputValue.trim();

    // Skip search right after a selection so the just-picked address
    // doesn't immediately re-trigger an API call.
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      setSuggestions([]);
      return;
    }

    if (trimmed === '') {
      setSuggestions([]);
      return;
    }

    // Skip search if input already matches the current selection
    if (value && value.formattedAddress === trimmed) {
      setSuggestions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      void fetchSuggestions(trimmed);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, value, fetchSuggestions, setSuggestions]);

  const handleSelect = async (suggestion: LocationDetail) => {
    justSelectedRef.current = true;
    setInputValue(suggestion.formattedAddress);
    setSuggestions([]);

    if (!onChange) {
      Keyboard.dismiss();
      return;
    }

    try {
      setResolving(true);
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
    } finally {
      setResolving(false);
      Keyboard.dismiss();
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    onChange?.(null);
  };

  const showDropdown = inputValue.trim().length > 0;

  return (
    <View className={cn('w-full', className)}>
      <View className="relative justify-center">
        <View className="pointer-events-none absolute left-3 z-10">
          {loading || resolving ? (
            <ActivityIndicator size="small" color="#94A3B8" />
          ) : (
            <MapPin size={16} color="#94A3B8" />
          )}
        </View>
        <TextInput
          value={inputValue}
          onChangeText={(text) => setInputValue(text)}
          onBlur={onBlur}
          placeholder={placeholder}
          editable={!disabled}
          className={cn(
            'rounded-md border bg-white px-9 py-2.5 text-base text-slate-900',
            error ? 'border-red-500 bg-red-50' : 'border-slate-200',
            disabled && 'opacity-50'
          )}
        />
        {inputValue.length > 0 && !disabled && (
          <Pressable
            onPress={handleClear}
            className="absolute right-3 rounded-full p-0.5"
            hitSlop={8}
          >
            <X size={16} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {showDropdown && (
        <View className="mt-1 max-h-60 rounded-md border border-slate-200 bg-white">
          {loading && (
            <View className="items-center py-3">
              <ActivityIndicator size="small" color="#94A3B8" />
            </View>
          )}
          {!loading && suggestions.length === 0 && (
            <View className="px-3 py-3">
              <Text className="text-sm text-slate-500">No matches found</Text>
            </View>
          )}
          {!loading &&
            suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.providerId}
                onPress={() => void handleSelect(suggestion)}
                className="flex-row items-center gap-3 border-b border-slate-100 px-3 py-2.5 active:bg-slate-100"
              >
                <MapPin size={16} color="#94A3B8" />
                <Text
                  className="flex-1 text-sm text-slate-700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {suggestion.formattedAddress}
                </Text>
              </Pressable>
            ))}
        </View>
      )}
    </View>
  );
}

export default LocationAutocomplete;
