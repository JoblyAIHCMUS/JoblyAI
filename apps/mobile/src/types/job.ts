export interface FilterItem {
  label: string;
  value?: string | number;
}

export interface FilterGroupData {
  title: string;
  items: FilterItem[];
  checked: string[];
}

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export type RequirementImportance = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

export type SortOption =
  | 'MOST_RELEVANT'
  | 'NEWEST'
  | 'OLDEST'
  | 'SALARY_ASC'
  | 'SALARY_DESC';

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PopularJobCategory extends JobCategory {
  jobCount: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedJobsResponse {
  jobs: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListJobsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  type?: EmploymentType[];
  remote?: boolean;
}

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
