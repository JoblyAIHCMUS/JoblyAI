import { useQuery } from '@tanstack/react-query';
import { listCompanyJobs } from '../api/jobs';
import type { PaginatedJobsResponse } from '../types/job';

const COMPANY_JOBS_PAGE_SIZE = 10;

export function useCompanyJobs(
  companyId?: number | null,
  page = 1,
  pageSize = COMPANY_JOBS_PAGE_SIZE
) {
  return useQuery<PaginatedJobsResponse, Error>({
    queryKey: ['company-jobs', companyId, page, pageSize],
    queryFn: async ({ signal }) => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      return await listCompanyJobs(companyId, page, pageSize, {
        signal,
      });
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });
}
