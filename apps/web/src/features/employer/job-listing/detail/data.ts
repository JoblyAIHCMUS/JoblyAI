import {
  type JobListingStatus,
  type EmploymentType,
} from '@/features/employer/job-listing/data';
import { type SkillEntry } from '@/components/employer/skillTagsManager';
import { type HiringStage } from '@/features/employer/hiringStage';
import { type JobCategory } from '@/types/job';

export type Category = JobCategory;

export type SalaryCurrency =
  | 'none'
  | 'usd'
  | 'eur'
  | 'gbp'
  | 'vnd'
  | 'jpy'
  | 'cny';

export interface Applicant {
  id: string;
  applicantId: string;
  name: string;
  image: string;
  appliedDate: string;
  score: number;
  hiringStage: HiringStage;
}

export interface JobListingDetail {
  id: string;
  title: string;
  status: JobListingStatus;
  employmentType: EmploymentType;
  remote: boolean;
  location?: string;
  category: Category;
  salaryCurrency: SalaryCurrency;
  salaryMin: string;
  salaryMax: string;
  skills: SkillEntry[];
  datePosted: string;
  dateClosed: string | null;
  description: string;
  applicants: Applicant[];
  /** Monthly view counts starting from the posting month (index 0 = posting month). */
  monthlyViews: number[];
}
