export type {
  Job,
  EmploymentType,
  JobStatus,
  RequirementImportance,
  FilterItem,
  FilterGroupData,
  JobCategory,
  CompanyInfo,
  JobPosting,
} from '@/types/job';

import type {
  EmploymentType,
  RequirementImportance,
  JobPosting,
} from '@/types/job';

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
  type?: EmploymentType[];
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
  type?: EmploymentType | EmploymentType[];
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
  type?: EmploymentType | EmploymentType[];
  categoryId?: number;
  companyId?: number;
  requirements?: JobRequirementInput[];
}
