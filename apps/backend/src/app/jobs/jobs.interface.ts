import { EmploymentType, JobStatus, RequirementImportance } from '@prisma/client';

export interface CompanyInfo {
  id: number;
  name: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface JobRequirement {
  skillId: number;
  skillName: string;
  importance: RequirementImportance;
  minYearsExperience: number | null;
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
  requirements: JobRequirement[];
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

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}
