import { LocationDetail } from '../location';

export interface Company {
  id: number;
  name: string;
  slug: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
  location: string | null;
  locationDetail?: LocationDetail | null;
  adminId: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  locations: string[];
  locationDetails?: LocationDetail[];
  employers?: Array<{
    id: number;
    companyId: number | null;
    employerId: string;
    role: string;
    assignedAt: string;
    employer: {
      id: string;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  _count?: {
    jobPostings: number;
  };
}

export interface CreateCompanyPayload {
  name: string;
  websiteUrl?: string;
  sizeRange?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  location?: LocationDetail;
  images?: string[];
  locations?: LocationDetail[];
}

export interface UpdateCompanyPayload {
  name: string;
  websiteUrl?: string;
  sizeRange?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  location?: LocationDetail;
  images?: string[];
  locations?: LocationDetail[];
}

export interface PatchCompanyPayload {
  name?: string;
  websiteUrl?: string;
  sizeRange?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  location?: LocationDetail;
  images?: string[];
  locations?: LocationDetail[];
}

export interface AddCompanyEmployeePayload {
  email: string;
  role?: string;
}

export interface UpdateCompanyEmployeeRolePayload {
  email: string;
  role: 'admin' | 'employee';
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

export interface ListCompaniesQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  location?: string;
  industry?: string[];
  sizeRange?: string[];
}

export interface PaginatedCompaniesResponse {
  companies: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
