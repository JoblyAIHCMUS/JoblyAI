import { KeyboardEvent, useEffect, useState } from 'react';

import {
  FilterDraft,
} from '../types';
import { UseApplicationsPageStateParams } from './types';

function buildFilterDraft(
  applicationFilter: UseApplicationsPageStateParams['applicationFilter'],
  advancedFilters: UseApplicationsPageStateParams['advancedFilters']
): FilterDraft {
  return {
    status: applicationFilter,
    company: advancedFilters.company,
    jobType: advancedFilters.jobType,
    location: advancedFilters.location,
  };
}

export function useApplicationsPageState({
  applicationFilter,
  setApplicationFilter,
  advancedFilters,
  applyAdvancedFilters,
  clearAdvancedFilters,
  applySearch,
}: UseApplicationsPageStateParams) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(() =>
    buildFilterDraft(applicationFilter, advancedFilters)
  );

  useEffect(() => {
    if (!isFilterDialogOpen) {
      return;
    }

    setFilterDraft(buildFilterDraft(applicationFilter, advancedFilters));
  }, [
    applicationFilter,
    advancedFilters,
    isFilterDialogOpen,
  ]);

  const handleSearchSubmit = () => {
    // TODO(real-api): Keep this trigger; only swap implementation in hook/service.
    applySearch();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applySearch();
    }
  };

  const handleApplyFilters = () => {
    // TODO(real-api): When backend adds server-side filter params, this handler can stay unchanged.
    setApplicationFilter(filterDraft.status);
    applyAdvancedFilters({
      company: filterDraft.company,
      jobType: filterDraft.jobType,
      location: filterDraft.location,
    });
    setIsFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    // TODO(real-api): If filter state is synced to URL/query params, clear them here too.
    clearAdvancedFilters();
    setFilterDraft({
      status: 'all',
      company: '',
      jobType: '',
      location: '',
    });
    setIsFilterDialogOpen(false);
  };

  return {
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    filterDraft,
    setFilterDraft,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleApplyFilters,
    handleClearFilters,
  };
}
