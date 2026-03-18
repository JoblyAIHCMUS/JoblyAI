import { ApplicationFilter } from '@/types/candidate';

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
