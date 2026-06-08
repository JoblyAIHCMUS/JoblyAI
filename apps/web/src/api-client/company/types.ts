export interface Company {
  id: number;
  name: string;
  slug: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
  adminId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface PatchCompanyPayload {
  name?: string;
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
