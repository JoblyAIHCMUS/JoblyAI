import { useState } from 'react';
import { jobService } from '@/services/jobService';
import { SortOption } from '@/mocks/sortOptions';
import { ViewMode } from '@/types/job';

export function useJobs() {
  const jobs = jobService.getJobs();
  const sortOptions = jobService.getSortOptions();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSelectSort = (option: SortOption) => {
    setSelectedSort(option);
    setIsSortOpen(false);
  };

  return {
    jobs,
    sortOptions,
    isSortOpen,
    setIsSortOpen,
    selectedSort,
    handleSelectSort,
    viewMode,
    setViewMode,
  };
}
