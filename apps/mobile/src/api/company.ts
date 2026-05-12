import { apiClient } from './config';
import { Company } from '../types/company';
import { ApiOptions } from './jobs';

export async function getCompanies(options?: ApiOptions): Promise<Company[]> {
  const response = await apiClient.get<Company[]>('/company', {
    signal: options?.signal,
  });
  return response.data;
}

export async function getTopCompaniesWithMostJobs(
  limit: number,
  options?: ApiOptions
): Promise<Company[]> {
  const response = await apiClient.get<Company[]>('/company/top', {
    params: { limit },
    signal: options?.signal,
  });
  return response.data;
}
