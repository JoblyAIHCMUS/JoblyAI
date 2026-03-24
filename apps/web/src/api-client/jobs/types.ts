export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'TEMPORARY'
  | 'INTERNSHIP';
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type RequirementImportance = 'REQUIRED' | 'PREFERRED' | 'NICE_TO_HAVE';

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}

export interface JobPosting {
  id: number;
  employerId: string;
  category: JobCategory;
  title: string;
  description: string;
  companyName: string | null;
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
  companyName?: string;
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
  companyName?: string;
  requirements?: JobRequirementInput[];
}
