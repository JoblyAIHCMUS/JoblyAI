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
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfileResponse {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isDefault?: boolean;
}

export interface UpdateResumePayload {
  id: number;
  fileUrl?: string;
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