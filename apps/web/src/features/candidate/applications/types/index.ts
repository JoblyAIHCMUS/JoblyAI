import {
  ApplicationFilter,
  ApplicationItem,
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
  applications: ApplicationItem[];
  applicationFilter: ApplicationFilter;
  setApplicationFilter: (filter: ApplicationFilter) => void;
  selectedStartDate: string;
  selectedEndDate: string;
  advancedFilters: CandidateApplicationsAdvancedFilter;
  applyAdvancedFilters: (filters: CandidateApplicationsAdvancedFilter) => void;
  clearAdvancedFilters: () => void;
  applySearch: () => void;
  currentPage: number;
  totalPages: number;
};
