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
  recruiterId: string;
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

export interface CandidateEducation {
  id: number;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface CandidateExperience {
  id: number;
  companyName: string;
  jobTitle: string;
  type: string; // e.g. 'Full-Time', 'Part-Time', 'Internship', etc.
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface CandidateCertificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface CandidateResume {
  id: number;
  isDefault?: boolean;
  fileName: string;
  fileKey: string; // S3 object key for private resume access
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  email: string;
  phone: string;
}

export interface Social {
  type: string;
  url: string;
}
