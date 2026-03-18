'use client';

import { KeyboardEvent } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ApplicationsSearchToolbarProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  isSearching: boolean;
  activeAdvancedFilterCount: number;
  onOpenFilter: () => void;
};

export function ApplicationsSearchToolbar({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSearchKeyDown,
  isSearching,
  activeAdvancedFilterCount,
  onOpenFilter,
}: ApplicationsSearchToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-[family-name:var(--family-primary)] text-[32px] font-semibold leading-[38px] tracking-[-0.2px] text-[#25324b]">
        Applications History
      </p>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search company, title, location..."
            className="h-10 w-full min-w-[240px] border-[#d6ddeb] text-sm text-[#25324b] sm:w-[320px]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onSearchSubmit}
            className="h-10 border-[#d6ddeb] px-3 text-[#25324b]"
            disabled={isSearching}
          >
            <Search className="h-5 w-5" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <button
          type="button"
          onClick={onOpenFilter}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d6ddeb] bg-white px-4 py-2 text-base text-[#25324b]"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Filter
          {activeAdvancedFilterCount > 0 && (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#4640de] px-2 py-0.5 text-xs font-semibold text-white">
              {activeAdvancedFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
