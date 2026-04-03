import { useState, useEffect } from 'react';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { SortOption, SORT_OPTIONS } from '@/mocks/sortOptions';
import { ViewMode } from '@/types/job';

export function useJobs(
  currentPage: number,
  pageSize = 5,
  searchTerm?: string,
  location?: string
) {
  const sortOptions = SORT_OPTIONS.slice() as SortOption[];
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { fetchJobs, loading, error, data } = useListJobs();

  useEffect(() => {
    fetchJobs({
      page: currentPage,
      pageSize,
      sort: selectedSort,
      q: searchTerm,
      location: location,
    });
  }, [currentPage, pageSize, selectedSort, searchTerm, location]);

  const handleSelectSort = (option: SortOption) => {
    setSelectedSort(option);
    setIsSortOpen(false);
  };

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    sortOptions,
    isSortOpen,
    setIsSortOpen,
    selectedSort,
    handleSelectSort,
    viewMode,
    setViewMode,
    loading,
    error,
  };
}
