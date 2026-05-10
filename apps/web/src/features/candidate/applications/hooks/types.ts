import {
  ApplicationFilter,
  CandidateApplicationsAdvancedFilter,
} from '@/types/candidate';

export type UseApplicationsPageStateParams = {
  applicationFilter: ApplicationFilter;
  setApplicationFilter: (filter: ApplicationFilter) => void;
  advancedFilters: CandidateApplicationsAdvancedFilter;
  applyAdvancedFilters: (filters: CandidateApplicationsAdvancedFilter) => void;
  clearAdvancedFilters: () => void;
  applySearch: () => void;
};
