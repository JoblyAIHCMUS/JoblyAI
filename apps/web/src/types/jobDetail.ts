export type CategoryPillColor = 'orange' | 'teal';

export interface JobDescriptionContent {
  overview: string;
  responsibilities: string[];
  whoYouAre: string[];
  niceToHaves: string[];
}

export interface JobSalary {
  min: number;
  max: number;
  currency: string;
}

export interface JobAboutRole {
  appliedCount: number;
  capacity: number;
  applyBefore: string;
  postedOn: string;
  jobType: string;
  salary: JobSalary;
}

export interface JobCategory {
  label: string;
  color: CategoryPillColor;
}

export interface JobDetail {
  description: string;
  aboutRole: JobAboutRole;
  category: JobCategory;
  requiredSkills: string[];
}

export interface JobDetailBreadcrumbItem {
  label: string;
  href?: string;
}

export interface JobDetailPageData {
  jobId: string;
  breadcrumbItems: JobDetailBreadcrumbItem[];
  jobName: string;
  companyName: string;
  address: string;
  workType: string;
  logoUrl: string;
  companyDescription: string;
  companyPhotos: string[];
  companyPageUrl: string;
}
