export type {
  CandidateEducation,
  CandidateCertificate,
  CandidateExperience,
  CandidateResume,
  CandidateContact,
  CandidateSocial,
  CandidateSkill,
} from '@/types/candidate';
import {
  CandidateEducation,
  CandidateCertificate,
  CandidateExperience,
  CandidateResume,
  CandidateContact,
  CandidateSocial,
  CandidateSkill,
} from '@/types/candidate';
import type { EmploymentType } from '@/types/job';

export interface CandidateProfileResponse {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date | string; // Can be Date or ISO string
  gender?: string;
  avatarUrl?: string;
  verified: boolean;
  image: string;
  role: string;
  banned: boolean;
  banReason: string;
  banExpires?: Date;
  educations?: CandidateEducation[];
  certificates?: CandidateCertificate[];
  experiences?: CandidateExperience[];
  resumes?: CandidateResume[];
  createdAt: Date;
  location: string;
  about?: {
    id: number;
    title?: string;
    bio?: string;
  }; // Changed from string[] to object
  openForOpportunities?: boolean;
  skills?: CandidateSkill[];
  portfolios?: { img: string; name: string }[];
  contacts?: CandidateContact[];
  socials?: CandidateSocial[];
  banner?: string;
}

export interface CreateEducationPayload {
  school: string;
  degree?: Degree;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface UpdateEducationPayload extends CreateEducationPayload {
  id: number;
}

export interface CreateExperiencePayload {
  companyName: string;
  type?: EmploymentType; // e.g. 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface UpdateExperiencePayload extends CreateExperiencePayload {
  id: number;
}

export interface CreateResumePayload {
  fileKey: string; // S3 object key for private resume access
  fileName: string;
  fileType: string;
  fileSize: number;
  isDefault?: boolean;
}

export interface UpdateResumePayload {
  id: number;
  fileKey?: string; // S3 object key for private resume access
  fileName?: string;
  isDefault?: boolean;
}

export interface CreateCertificatePayload {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface UpdateCertificatePayload extends CreateCertificatePayload {
  id: number;
}

export interface CreateSocialPayload {
  platform: string;
  url: string;
  username?: string;
}

export interface UpdateSocialPayload extends CreateSocialPayload {
  id: number;
}

export interface CreateContactPayload {
  type?: string;
  value: string;
  isPrimary?: boolean;
}

export interface UpdateContactPayload extends CreateContactPayload {
  id: number;
}
import type { Degree } from '@/types/candidate';
