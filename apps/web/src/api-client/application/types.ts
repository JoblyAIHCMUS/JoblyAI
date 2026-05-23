export type ApplicationStatus =
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationJob {
  id: number;
  title: string;
  description: string;
  companyName: string | null;
  companyLogoUrl: string | null;
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
}

export interface ApplicationResume {
  id: number;
  fileKey?: string; // S3 object key for private resume access - use presigned download URL to view (might be empty during migration)
  aiScore: number | null;
  isDefault: boolean;
}

export interface ApplicationCandidate {
  id: string;
  name: string | null;
  email: string;
}

export interface ApplicationRecord {
  id: number;
  jobId: number;
  candidateId: string;
  resumeId: number;
  status: ApplicationStatus;
  matchPercentage: number | null;
  aiFeedback: unknown | null;
  jobDeletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  job: ApplicationJob;
  resume: ApplicationResume;
  candidate?: ApplicationCandidate;
}

export interface PaginatedApplicationsResponse {
  applications: ApplicationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateApplicationPayload {
  jobId: number;
  resumeId: number;
}

export interface CandidateApplicationsQuery {
  page?: number;
  pageSize?: number;
  status?: ApplicationStatus;
}

export interface EmployerApplicationsQuery {
  jobId?: number;
  status?: ApplicationStatus;
  page?: number;
  pageSize?: number;
}

export interface RejectApplicationPayload {
  feedback: string;
}
