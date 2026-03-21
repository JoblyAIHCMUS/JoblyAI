export type ApplicationStatus =
  | 'applied'
  | 'viewed'
  | 'interviewing'
  | 'offered'
  | 'rejected';

export type ApplicationFilter = 'all' | 'active' | 'closed';

export type ApplicationItem = {
  id: string;
  company: string;
  logoUrl?: string;
  location: string;
  jobType: string;
  title: string;
  createdAt: string;
  status: ApplicationStatus;
};

export type ApplicationStatusMeta = Record<
  ApplicationStatus,
  { label: string; className: string }
>;

export type ApplicationFilterMeta = Record<
  ApplicationFilter,
  { label: string }
>;

export type CandidateApplicationsAdvancedFilter = {
  company: string;
  jobType: string;
  location: string;
};

export type CandidateApplicationsSearchParams = {
  query?: string;
  status?: ApplicationFilter;
  startDate?: string;
  endDate?: string;
  company?: string;
  jobType?: string;
  location?: string;
};
