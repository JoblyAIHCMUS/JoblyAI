import { useEffect, useMemo, useState } from 'react';

import { candidateDashboardService } from '@/services/candidateDashboardService';
import { ApplicationFilter, ApplicationStatus } from '@/types/candidateDashboard';
import { usePagination } from './usePagination';

function isActiveStatus(status: ApplicationStatus) {
  return status === 'applied' || status === 'viewed' || status === 'interviewing';
}

function isClosedStatus(status: ApplicationStatus) {
  return status === 'offered' || status === 'rejected';
}

export function useCandidateDashboard() {
  const PAGE_SIZE = 10;
  const applications = candidateDashboardService.getApplications();
  const statusMeta = candidateDashboardService.getStatusMeta();
  const filterMeta = candidateDashboardService.getFilterMeta();
  const [applicationFilter, setApplicationFilter] =
    useState<ApplicationFilter>('all');

  const filteredApplications = useMemo(() => {
    if (applicationFilter === 'all') {
      return applications;
    }

    if (applicationFilter === 'active') {
      return applications.filter((item) => isActiveStatus(item.status));
    }

    return applications.filter((item) => isClosedStatus(item.status));
  }, [applicationFilter, applications]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const { currentPage, setCurrentPage, goPrev, goNext } =
    usePagination(totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [applicationFilter, setCurrentPage]);

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
    applications,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    goToPreviousPage: goPrev,
    goToNextPage: goNext,
    statusMeta,
    filterMeta,
  };
}
