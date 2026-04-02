import { CandidateEducation, CandidateExperience } from "@/types/profile";

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
  contact: { email: string; phone: string };
  socials: Array<any>;
}
