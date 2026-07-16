import {
  EmploymentType,
  JobStatus,
  RequirementImportance,
} from '@prisma/client';

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

export interface LocationDetail {
  id: string;
  provider: string;
  providerId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
}

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
  preShortlistThreshold: number;
  preShortlistEnabled: boolean;
  preShortlistQuestions: { id: string; order: number; question: string }[];
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
  iconKey: string | null;
}

export interface PopularJobCategory extends JobCategory {
  jobCount: number;
}
