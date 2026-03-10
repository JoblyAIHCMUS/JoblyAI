import { FILTER_GROUPS } from '@/mocks/filters';
import { JOBS } from '@/mocks/jobs';
import { SORT_OPTIONS } from '@/mocks/sortOptions';

export const jobService = {
  getJobs() {
    return JOBS;
  },
  getFilters() {
    return FILTER_GROUPS;
  },
  getSortOptions() {
    return SORT_OPTIONS;
  },
};
