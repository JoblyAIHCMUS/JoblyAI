import { type HiringStage } from '@/features/employer/hiringStage';
import { type JobCategory } from '@/types/job';
import { type EmploymentType } from '@/features/employer/job-listing/data';

export interface ApplicantDetail {
  id: string;
  applicantId: string;
  name: string;
  image: string | null;
  email: string;
  phone: string;
  title: string;
  jobListingId: string;
  appliedRole: string;
  jobCategory: JobCategory;
  employmentType: EmploymentType;
  appliedDate: string;
  resume: string;
  score: number;
  hiringStage: HiringStage;
}

export const hiringStageProgress: Record<HiringStage, number> = {
  Applied: 20,
  Interview: 40,
  Offered: 80,
  Rejected: 0,
  Withdrawn: 0,
};

export const hiringStageColor: Record<HiringStage, string> = {
  Applied: 'bg-blue-500',
  Interview: 'bg-amber-500',
  Offered: 'bg-green-500',
  Rejected: 'bg-red-500',
  Withdrawn: 'bg-gray-500',
};
