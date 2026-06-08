export interface EmployerCompany {
  id: number;
  name: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  sizeRange?: string | null;
  adminId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployerProfileResponse {
  id: string;
  email: string;
  verified: boolean;
  image?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  fullName: string;
  role?: string;
  company?: EmployerCompany;
  isCompanyAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  banned: boolean;
  bannedReason?: string;
  banExpires?: Date;
}

export interface UpdateEmployerProfilePayload {
  firstName?: string;
  lastName?: string;
  role?: string;
  companyId?: number;
}

export type UpdateEmployerProfileResponse = EmployerProfileResponse;

export interface EmployerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}
