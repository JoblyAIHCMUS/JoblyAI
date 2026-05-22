import { apiClient } from './config';
import { Company } from '../types/company';
import { ApiOptions } from './jobs';

export interface CreateCompanyPayload {
  name: string;
  websiteUrl?: string;
  sizeRange?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
}

export interface AddCompanyEmployeePayload {
  email: string;
  role?: string;
}

export interface CompanyEmployeeMembership {
  id: number;
  companyId: number | null;
  employerId: string;
  role: string;
  assignedAt: string;
}

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

export async function createCompany(
  payload: CreateCompanyPayload
): Promise<Company> {
  const response = await apiClient.post<Company>('/company', payload);
  return response.data;
}

export async function addCompanyEmployee(
  companyId: number,
  payload: AddCompanyEmployeePayload
): Promise<CompanyEmployeeMembership> {
  const response = await apiClient.post<CompanyEmployeeMembership>(
    `/company/${companyId}/employees`,
    payload
  );
  return response.data;
}
