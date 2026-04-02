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
  'In Review': 25,
  Shortlisted: 50,
  Hired: 100,
  Declined: 0,
};

export const hiringStageColor: Record<HiringStage, string> = {
  'In Review': 'bg-indigo-500',
  Shortlisted: 'bg-amber-500',
  Hired: 'bg-green-500',
  Declined: 'bg-red-500',
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
    hiringStage: 'Shortlisted',
  },
};
