import type { SimilarJob } from '@/types/similarJob';

export interface CompanyProfileStat {
  label: string;
  value: string;
}

export interface CompanyContactLink {
  type: 'website' | 'twitter' | 'facebook' | 'linkedin';
  label: string;
  href: string;
}

export interface CompanyTeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  openJobsCount: number;
  description: string;
  officeSummary: string;
  officeLocations: string[];
  contacts: CompanyContactLink[];
  stats: CompanyProfileStat[];
  gallery: string[];
  team: CompanyTeamMember[];
  openJobs: SimilarJob[];
}
