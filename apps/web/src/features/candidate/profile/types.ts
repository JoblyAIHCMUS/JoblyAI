import {
  CandidateEducation,
  CandidateExperience,
  Contact,
  Social,
} from '@/types/profile';

export interface CandidateProfileUI {
  name: string;
  title: string;
  avatar: string;
  banner: string;
  openForOpportunities: boolean;
  about: string[];
  experiences: Array<CandidateExperience>;
  educations: Array<CandidateEducation>;
  skills: Array<any>;
  portfolios: Array<any>;
  contact: Contact;
  socials: Array<Social>;
}
