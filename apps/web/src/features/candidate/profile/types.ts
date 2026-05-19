import {
  CandidateEducation,
  CandidateExperience,
  CandidateCertificate,
  CandidateSkill,
  CandidateContact,
  CandidateSocial,
} from '@/types/candidate';

export interface PortfolioItem {
  img: string;
  name: string;
}

export interface Contact {
  email: string;
  phone: string;
}

export interface CandidateProfileUI {
  name: string;
  email: string;
  phone: string;
  title: string;
  avatar: string;
  banner: string;
  openForOpportunities: boolean;
  about: string[];
  experiences: Array<CandidateExperience>;
  educations: Array<CandidateEducation>;
  skills: CandidateSkill[];
  certificates: CandidateCertificate[];
  portfolios: PortfolioItem[];
  contact: Contact; // Keeping for backward compatibility with some UI parts
  contacts: CandidateContact[];
  socials: Array<CandidateSocial>;
}
