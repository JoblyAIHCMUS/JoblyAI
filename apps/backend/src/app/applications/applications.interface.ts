import { ApplicationStatus } from '@prisma/client';

export interface CompanyInfo {
  id: number;
  name: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface Application {
  id: number;
  jobId: number;
  candidateId: string;
  resumeId: number;
  status: ApplicationStatus;
  matchPercentage: number | null;
  aiFeedback: unknown | null; // JSON field
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: number;
    title: string;
    description: string;
    company: CompanyInfo;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    remote: boolean;
    type: string;
    status: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
    postedBy: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  resume: {
    id: number;
    fileKey: string; // S3 object key for private resume access
    aiScore: number | null;
    isDefault: boolean;
  };
  candidate?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface PaginatedApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
