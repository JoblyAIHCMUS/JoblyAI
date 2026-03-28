export interface EmployerCompany {
  id: number;
  name: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  sizeRange?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployerProfileResponse {
  id: string;
  email: string;
  verified: boolean;
  image?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role?: string;
  company?: EmployerCompany;
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

export interface UpdateEmployerProfileResponse {
  message: string;
}
