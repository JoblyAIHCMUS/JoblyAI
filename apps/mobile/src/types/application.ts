export type ApplicationStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';

export interface ApplicationRecord {
  id: number;
  status: ApplicationStatus;
  createdAt: string;
}

export interface PaginatedApplicationsResponse {
  applications: ApplicationRecord[];
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
}
