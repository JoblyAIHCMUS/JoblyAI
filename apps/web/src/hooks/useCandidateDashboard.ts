import { useEffect, useMemo, useState } from 'react';

import { candidateDashboardService } from '@/services/candidateDashboardService';
import { ApplicationFilter } from '@/types/candidate';
import { toDateInputValue } from '@/lib/candidateDate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';
import { usePagination } from './usePagination';

function getInitialWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function useCandidateDashboard() {
  const PAGE_SIZE = 10;
  const applications = candidateDashboardService.getApplications();
  const statusMeta = candidateDashboardService.getStatusMeta();
  const filterMeta = candidateDashboardService.getFilterMeta();
  const initialWeekRange = getInitialWeekRange();
  const [applicationFilter, setApplicationFilter] =
    useState<ApplicationFilter>('all');
  const [selectedStartDate, setSelectedStartDate] = useState(
    initialWeekRange.startDate
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    initialWeekRange.endDate
  );

  const statusFilteredApplications = useMemo(() => {
    if (applicationFilter === 'all') {
      return applications;
    }

    if (applicationFilter === 'active') {
      return applications.filter((item) =>
        isActiveApplicationStatus(item.status)
      );
    }

    return applications.filter((item) =>
      isClosedApplicationStatus(item.status)
    );
  }, [applicationFilter, applications]);

  const filteredApplications = useMemo(() => {
    return candidateDashboardService.filterApplicationsByDate(
      statusFilteredApplications,
      selectedStartDate,
      selectedEndDate
    );
  }, [statusFilteredApplications, selectedStartDate, selectedEndDate]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE)
  );
  const { currentPage, setCurrentPage, goPrev, goNext } =
    usePagination(totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [applicationFilter, selectedStartDate, selectedEndDate, setCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredApplications.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredApplications, PAGE_SIZE]);

  return {
    applicationFilter,
    setApplicationFilter,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    applications,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    goToPage: setCurrentPage,
    goToPreviousPage: goPrev,
    goToNextPage: goNext,
    statusMeta,
    filterMeta,
  };
}
