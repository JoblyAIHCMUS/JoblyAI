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
  location: string;
  jobType: string;
  title: string;
  appliedDate: string;
  status: ApplicationStatus;
  accent: string;
};

export type ApplicationStatusMeta = Record<
  ApplicationStatus,
  { label: string; className: string }
>;

export type ApplicationFilterMeta = Record<
  ApplicationFilter,
  { label: string }
>;
