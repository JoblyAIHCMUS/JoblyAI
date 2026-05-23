import { useCallback, useState } from 'react';

import { listCandidateApplications, ApiOptions } from '../api/application';
import {
  CandidateApplicationsQuery,
  PaginatedCandidateApplicationsResponse,
  CandidateApplicationRecord,
} from '../types/application';

async function fetchAllCandidateApplications(
  query?: CandidateApplicationsQuery,
  options?: ApiOptions
): Promise<PaginatedCandidateApplicationsResponse> {
  const pageSize = query?.pageSize ?? 100;
  let page = query?.page ?? 1;
  let totalPages = 1;
  const applications: CandidateApplicationRecord[] = [];
  let total = 0;

  do {
    const response = await listCandidateApplications(
      {
        ...query,
        page,
        pageSize,
      },
      options
    );

    applications.push(...response.applications);
    total = response.total;
    totalPages = Math.max(1, response.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return {
    applications,
    total,
    page: 1,
    pageSize,
    totalPages: Math.max(1, totalPages),
  };
}

export function useListCandidateApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] =
    useState<PaginatedCandidateApplicationsResponse | null>(null);

  const fetchApplications = useCallback(
    async (query?: CandidateApplicationsQuery) => {
      const controller = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAllCandidateApplications(query, {
          signal: controller.signal,
        });
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchApplications, loading, error, data };
}
