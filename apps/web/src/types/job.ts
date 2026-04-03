export type ViewMode = 'grid' | 'list';

export interface FilterItem {
  label: string;
}

export interface FilterGroupData {
  title: string;
  items: FilterItem[];
  checked: string[];
}

export interface Job {
  companyName: string;
  title: string;
  location: string;
  logoUrl: string;
}

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