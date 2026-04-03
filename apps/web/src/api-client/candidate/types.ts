// Re-export types for compatibility with hooks and consumers
export type {
  CandidateEducation,
  CandidateCertificate,
  CandidateExperience,
  CandidateResume,
} from '@/types/candidate';
import {
  CandidateEducation,
  CandidateCertificate,
  CandidateExperience,
  CandidateResume,
} from '@/types/candidate';

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
  skills?: string[];
  portfolios?: { img: string; name: string }[];
  contact?: { email: string; phone?: string };
  socials?: { type: string; url: string }[];
  banner?: string;
}

export interface CreateEducationPayload {
  school: string;
  degree?: string;
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
  type?: string; // e.g. 'Full-Time', 'Part-Time', 'Internship', etc.
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
