export type ApplicationStatus =
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationRecord {
  id: number;
  status: ApplicationStatus;
  createdAt: string;
}

export interface CandidateApplicationRecord {
  id: number;
  status: ApplicationStatus;
  createdAt: string;
  job: {
    title: string;
    companyName: string | null;
    companyLogoUrl: string | null;
    location: string | null;
    remote: boolean;
    type: string;
    postedBy: {
      id: string;
      name: string | null;
      email: string;
    };
  };
}

export interface PaginatedApplicationsResponse {
  applications: ApplicationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedCandidateApplicationsResponse {
  applications: CandidateApplicationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployerApplicationsQuery {
  jobId?: number;
  status?: ApplicationStatus;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CandidateApplicationsQuery {
  page?: number;
  pageSize?: number;
}
