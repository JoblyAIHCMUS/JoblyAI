import axios from 'axios';
import type {
  AddCompanyEmployeePayload,
  Company,
  CompanyEmployee,
  CompanyEmployeeMembership,
  CreateCompanyPayload,
  PatchCompanyPayload,
  UpdateCompanyPayload,
} from '@/api-client/company/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCompanies(): Promise<Company[]> {
  const response = await axios.get<Company[]>(`${API_BASE_URL}/api/company`, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
}

export async function getCompanyById(id: number): Promise<Company> {
  const response = await axios.get<Company>(
    `${API_BASE_URL}/api/company/${id}`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
}

export async function getCompanyBySlug(slug: string): Promise<Company> {
  const response = await axios.get<Company>(
    `${API_BASE_URL}/api/company/slug/${slug}`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
}

export async function createCompany(
  payload: CreateCompanyPayload
): Promise<Company> {
  const response = await axios.post<Company>(
    `${API_BASE_URL}/api/company`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function updateCompany(
  id: number,
  payload: UpdateCompanyPayload
): Promise<Company> {
  const response = await axios.put<Company>(
    `${API_BASE_URL}/api/company/${id}`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function patchCompany(
  id: number,
  payload: PatchCompanyPayload
): Promise<Company> {
  const response = await axios.patch<Company>(
    `${API_BASE_URL}/api/company/${id}`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function deleteCompany(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/company/${id}`, {
    withCredentials: true,
  });
}

export interface UpdateCompanyLogoPayload {
  fileKey: string;
  fileUrl: string;
}

export async function updateCompanyLogo(
  id: number,
  payload: UpdateCompanyLogoPayload
): Promise<Company> {
  const response = await axios.patch<Company>(
    `${API_BASE_URL}/api/company/${id}/logo`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function addCompanyEmployee(
  companyId: number,
  payload: AddCompanyEmployeePayload
): Promise<CompanyEmployeeMembership> {
  const response = await axios.post<CompanyEmployeeMembership>(
    `${API_BASE_URL}/api/company/${companyId}/employees`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function getCompanyEmployees(
  companyId: number
): Promise<CompanyEmployee[]> {
  const response = await axios.get<CompanyEmployee[]>(
    `${API_BASE_URL}/api/company/${companyId}/employees`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export async function checkCompanyNameExists(name: string): Promise<boolean> {
  try {
    const response = await axios.get<{ exists: boolean }>(
      `${API_BASE_URL}/api/company/check-name`,
      {
        params: { name },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data.exists ?? false;
  } catch (error) {
    // If the endpoint doesn't exist or there's an error, return false
    // This allows the form to proceed; the server will validate on submission
    return false;
  }
}

export async function getRecommendedCompanies(limit: number) {
  const response = await axios.get<any[]>(
    `${API_BASE_URL}/api/company/recommended`,
    {
      params: { limit },
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}
