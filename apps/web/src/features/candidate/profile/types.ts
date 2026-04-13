import {
  CandidateEducation,
  CandidateExperience,
  Contact,
  Social,
} from '@/types/candidate';
import type { CandidateSkill } from '@/api-client/candidate/types';

export interface PortfolioItem {
  img: string;
  name: string;
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
  portfolios: PortfolioItem[];
  contact: Contact;
  socials: Array<Social>;
}
