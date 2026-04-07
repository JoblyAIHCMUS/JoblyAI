import { type HiringStage } from '@/features/employer/hiringStage';
import { type Category } from '@/features/employer/job-listing/detail/data';
import { type EmploymentType } from '@/features/employer/job-listing/data';

export interface ApplicantDetail {
  id: string;
  applicantId: string;
  name: string;
  image: string;
  email: string;
  phone: string;
  title: string;
  jobListingId: string;
  appliedRole: string;
  jobCategory: Category;
  employmentType: EmploymentType;
  appliedDate: string;
  resume: string;
  score: number;
  hiringStage: HiringStage;
}

export const hiringStageProgress: Record<HiringStage, number> = {
  Applied: 20,
  Interview: 40,
  Offer: 80,
  Rejected: 0,
  Withdrawn: 0,
};

export const hiringStageColor: Record<HiringStage, string> = {
  Applied: 'bg-blue-500',
  Interview: 'bg-amber-500',
  Offer: 'bg-green-500',
  Rejected: 'bg-red-500',
  Withdrawn: 'bg-gray-500',
};

export const applicantDetails: Record<string, ApplicantDetail> = {
  '1': {
    id: '1',
    applicantId: '1',
    name: 'Alice Johnson',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    email: 'alice.johnson@email.com',
    phone: '+1 (555) 123-4567',
    title: 'Social Media Specialist',
    jobListingId: '1',
    appliedRole: 'Social Media Assistant',
    jobCategory: 'marketing',
    employmentType: 'FULL_TIME',
    appliedDate: '2020-05-21',
    resume:
      'https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/mock_resume.pdf',
    score: 8.2,
    hiringStage: 'Interview',
  },
};
