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

export interface UpdateCompanyPayload {
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

export interface CompanyEmployee {
  membershipId: number;
  employerId: string;
  role: string;
  assignedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

export interface GetCompaniesParams extends ApiOptions {
  page?: number;
  pageSize?: number;
  q?: string;
  location?: string;
  sizeRange?: string[];
}

export interface PaginatedCompaniesResponse {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getCompanies(
  options?: GetCompaniesParams
): Promise<PaginatedCompaniesResponse> {
  const response = await apiClient.get<PaginatedCompaniesResponse>('/company', {
    signal: options?.signal,
    params: {
      page: options?.page,
      pageSize: options?.pageSize,
      q: options?.q,
      location: options?.location,
      sizeRange: options?.sizeRange,
    },
    paramsSerializer: {
      indexes: null,
    },
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

export async function updateCompany(
  id: number,
  payload: UpdateCompanyPayload
): Promise<Company> {
  const response = await apiClient.put<Company>(`/company/${id}`, payload);
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

export async function getCompanyEmployees(
  companyId: number
): Promise<CompanyEmployee[]> {
  const response = await apiClient.get<CompanyEmployee[]>(
    `/company/${companyId}/employees`
  );
  return response.data;
}

export async function checkCompanyNameExists(name: string): Promise<boolean> {
  try {
    const response = await apiClient.get<{ exists: boolean }>(
      '/company/check-name',
      {
        params: { name },
      }
    );
    return response.data.exists;
  } catch {
    // If endpoint doesn't exist or fails, assume name is available
    return false;
  }
}

export async function getCompanyById(
  id: number,
  options?: ApiOptions
): Promise<Company> {
  const response = await apiClient.get<Company>(`/company/${id}`, {
    signal: options?.signal,
  });
  return response.data;
}

export type CompanyRole = 'admin' | 'employee';

export interface UpdateCompanyEmployeeRolePayload {
  email: string;
  role: CompanyRole;
}

export interface RemoveCompanyEmployeePayload {
  email: string;
}

export async function updateCompanyEmployeeRole(
  companyId: number,
  payload: UpdateCompanyEmployeeRolePayload
): Promise<CompanyEmployeeMembership> {
  const response = await apiClient.patch<CompanyEmployeeMembership>(
    `/company/${companyId}/employees/role`,
    payload
  );
  return response.data;
}

export async function removeCompanyEmployee(
  companyId: number,
  payload: RemoveCompanyEmployeePayload
): Promise<void> {
  await apiClient.delete(`/company/${companyId}/employees`, { data: payload });
}
