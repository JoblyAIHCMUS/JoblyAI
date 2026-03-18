import {
  ApplicationFilter,
  CandidateApplicationsAdvancedFilter,
} from '@/types/candidate';

export type StatusTab = {
  key: ApplicationFilter;
  label: string;
  count: number;
};

export type FilterDraft = {
  status: ApplicationFilter;
  company: string;
  jobType: string;
  location: string;
};

export type UseApplicationsPageStateParams = {
  applicationFilter: ApplicationFilter;
  setApplicationFilter: (filter: ApplicationFilter) => void;
  advancedFilters: CandidateApplicationsAdvancedFilter;
  applyAdvancedFilters: (filters: CandidateApplicationsAdvancedFilter) => void;
  clearAdvancedFilters: () => void;
  applySearch: () => void;
};
