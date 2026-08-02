export type CategoryPillColor = 'orange' | 'teal';

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

export interface CompanyInfo {
  id: number;
  name: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface RequirementDetail {
  skillName: string;
  importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  minYearsExperience: number | null;
}

export interface JobDetail {
  description: string;
  aboutRole: JobAboutRole;
  category: JobCategory;
  requiredSkills: RequirementDetail[];
}

export interface JobDetailBreadcrumbItem {
  label: string;
  href?: string;
}

export interface JobDetailPageData {
  jobId: string;
  breadcrumbItems: JobDetailBreadcrumbItem[];
  jobName: string;
  company: CompanyInfo;
  address: string;
  workType: string;
  companyDescription: string;
  companyPhotos: string[];
  companyPageUrl: string;
}

/**
 * Props for JobDetailContent presentational component.
 * Contains all data needed for pure UI rendering, with no business logic.
 */
export interface JobDetailContentProps {
  /** Raw HTML or plain-text job description. */
  description: string;
  /** About role information including salary, dates, and capacity. */
  aboutRole: JobAboutRole;
  /** Category with label and color. */
  category: JobCategory;
  /** List of required skills with importance and years of experience. */
  requiredSkills: RequirementDetail[];
  /** Application progress as percentage (e.g., "50%"). */
  applicationProgress: string;
  /** Formatted salary string (e.g., "$75,000-$85,000"). */
  formattedSalary: string;
}
