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
