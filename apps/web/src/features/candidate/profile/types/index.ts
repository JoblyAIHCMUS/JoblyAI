export interface Experience {
  id: number;
  logo: string;
  company: string;
  role: string;
  type: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  location: string;
  desc: string;
}

export interface CandidateProfileUI {
  name: string;
  title: string;
  avatar: string;
  banner: string;
  openForOpportunities: boolean;
  about: string[];
  experiences: Array<Experience>;
  educations: Array<any>;
  skills: Array<any>;
  portfolios: Array<any>;
  contact: { email: string; phone: string };
  socials: Array<any>;
}