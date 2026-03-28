export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type RequirementImportance = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CompanyInfo {
  id: number;
  name: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface JobPosting {
  id: number;
  employerId: string;
  category: JobCategory;
  title: string;
  description: string;
  company: CompanyInfo;
  location: string | null;
  remote: boolean;
  type: EmploymentType;
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedJobsResponse {
  jobs: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query DTO types for list operations
export interface ListJobsQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  location?: string;
  type?: EmploymentType;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
}

// Payload types for create/update operations
export interface JobRequirementInput {
  skillId: number;
  importance?: RequirementImportance;
  minYearsExperience?: number;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remote?: boolean;
  type?: EmploymentType;
  categoryId: number;
  companyId: number;
  requirements?: JobRequirementInput[];
}

export interface UpdateJobPayload {
  title?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remote?: boolean;
  type?: EmploymentType;
  categoryId?: number;
  companyId?: number;
  requirements?: JobRequirementInput[];
}
