import { useCandidateApplicationsQuery } from '@/features/candidate/hooks/useCandidateApplicationsQuery';
import { useCandidateApplicationsViewModel } from '@/features/candidate/hooks/useCandidateApplicationsViewModel';

export function useCandidateDashboard() {
  const query = useCandidateApplicationsQuery();
  const viewModel = useCandidateApplicationsViewModel({
    applicationFilter: query.applicationFilter,
    advancedFilters: query.advancedFilters,
    applications: query.applications,
    selectedStartDate: query.selectedStartDate,
    selectedEndDate: query.selectedEndDate,
    currentPage: query.currentPage,
    totalPages: query.totalPages,
  });

  return {
    ...query,
    ...viewModel,
  };
}
