export type ViewMode = 'grid' | 'list';

export interface FilterItem {
  label: string;
  value?: string | number;
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
  | 'FREELANCE'
  | 'OTHER';
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export type RequirementImportance = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

export type SortOption =
  | 'MOST_RELEVANT'
  | 'NEWEST'
  | 'OLDEST'
  | 'SALARY_ASC'
  | 'SALARY_DESC'
  | 'EMBEDDING_SCORE'
  | 'EXACT_MATCH_SCORE';

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
  iconKey?: string | null;
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

export interface PreShortlistQuestion {
  id: string;
  order: number;
  question: string;
}

import { LocationDetail } from '@/api-client/location';

export interface JobPosting {
  id: number;
  employerId: string;
  category: JobCategory;
  title: string;
  description: string;
  company: CompanyInfo;
  location: string | null;
  locationDetail?: LocationDetail | null;
  remote: boolean;
  type: EmploymentType;
  requirements: JobRequirement[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  status: JobStatus;
  applicantsCount?: number;
  createdAt: Date;
  updatedAt: Date;
  matchPercentage?: number;
  exactMatchPercentage?: number;
  preShortlistThreshold: number;
  preShortlistEnabled: boolean;
  preShortlistQuestions: PreShortlistQuestion[];
}

export interface PaginatedJobsResponse {
  jobs: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type JobPostingFormData = {
  preShortlistThreshold: number;
  preShortlistQuestions: string[];
};
