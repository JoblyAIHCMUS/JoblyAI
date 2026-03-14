export interface CompanyCardData {
  id: string;
  name: string;
  openJobs: number;
  logoUrl: string;
  logoAlt: string;
  categoryId: string;
}

export interface CompaniesByCategoryData {
  totalResults: number;
  companies: CompanyCardData[];
}

export type CompanyCategoryTab = {
  id: string;
  name: string;
};
