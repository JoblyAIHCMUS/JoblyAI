import { useMemo, useState } from 'react';
import { jobService } from '@/services/jobService';
import { SortOption } from '@/mocks/sortOptions';
import { ViewMode } from '@/types/job';

export function useJobs(currentPage: number, pageSize = 5) {
  const allJobs = jobService.getJobs();
  const sortOptions = jobService.getSortOptions();

  const totalPages = Math.ceil(allJobs.length / pageSize);

  const jobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allJobs.slice(start, start + pageSize);
  }, [allJobs, currentPage, pageSize]);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSelectSort = (option: SortOption) => {
    setSelectedSort(option);
    setIsSortOpen(false);
  };

  return {
    jobs,
    totalPages,
    sortOptions,
    isSortOpen,
    setIsSortOpen,
    selectedSort,
    handleSelectSort,
    viewMode,
    setViewMode,
  };
}
