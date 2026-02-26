import { EmploymentType, JobStatus } from '@prisma/client';

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

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}
