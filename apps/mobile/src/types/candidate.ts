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
  description?: string;
}

export interface CandidateSkill {
  id: number;
  name: string;
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

export interface CandidateResume {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResumePayload {
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isDefault?: boolean;
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
  skills?: CandidateSkill[];
  contacts?: CandidateContact[];
  socials?: CandidateSocial[];
}
