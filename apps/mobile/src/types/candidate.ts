export interface CandidateAbout {
  id: number;
  title?: string;
  bio?: string;
}

export interface CandidateExperience {
  id: number;
  companyName: string;
  jobTitle: string;
  type?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

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

export interface CandidateCertificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface CandidateSkill {
  id: number;
  name: string;
  title?: string;
}

export interface CandidateContact {
  id: number;
  type?: string;
  value: string;
  isPrimary?: boolean;
}

export interface CandidateSocial {
  id: number;
  platform: string;
  url: string;
  username?: string;
}

export interface CandidateProfileResponse {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  location?: string;
  openForOpportunities?: boolean;
  about?: CandidateAbout;
  experiences?: CandidateExperience[];
  educations?: CandidateEducation[];
  certificates?: CandidateCertificate[];
  skills?: CandidateSkill[];
  contacts?: CandidateContact[];
  socials?: CandidateSocial[];
}
