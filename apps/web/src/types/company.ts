export type CompanyCategory =
  | 'design'
  | 'fintech'
  | 'hosting'
  | 'business-service'
  | 'developer';

export interface CompanyCardData {
  id: string;
  name: string;
  openJobs: number;
  logoUrl: string;
  logoAlt: string;
  category: CompanyCategory;
}

export interface CompaniesByCategoryData {
  totalResults: number;
  companies: CompanyCardData[];
}
