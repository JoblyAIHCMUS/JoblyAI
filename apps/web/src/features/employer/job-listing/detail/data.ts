import {
  type JobListingStatus,
  type EmploymentType,
} from '@/features/employer/job-listing/data';

export type WorkModel = 'on-site' | 'remote' | 'hybrid';

export type Category =
  | 'design'
  | 'marketing'
  | 'business'
  | 'technology'
  | 'sales'
  | 'finance'
  | 'human-resources'
  | 'operations'
  | 'other';

export type SalaryCurrency =
  | 'none'
  | 'usd'
  | 'eur'
  | 'gbp'
  | 'vnd'
  | 'jpy'
  | 'cny';

export type HiringStage =
  | 'In Review'
  | 'Shortlisted'
  | 'Interviewed'
  | 'Hired'
  | 'Declined';

export interface Applicant {
  id: string;
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
  workModel: WorkModel;
  category: Category;
  salaryCurrency: SalaryCurrency;
  salaryMin: string;
  salaryMax: string;
  skills: string[];
  datePosted: string;
  dateClosed: string | null;
  description: string;
  applicants: Applicant[];
}

export const jobListingDetails: Record<string, JobListingDetail> = {
  '1': {
    id: '1',
    title: 'Social Media Assistant',
    status: 'Live',
    employmentType: 'Full-time',
    workModel: 'remote',
    category: 'marketing',
    salaryCurrency: 'usd',
    salaryMin: '35000',
    salaryMax: '50000',
    skills: ['Social Media', 'Content Creation', 'Copywriting', 'Analytics'],
    datePosted: '2020-05-20',
    dateClosed: null,
    description:
      '<h2>About the Role</h2><p>We are looking for a <strong>Social Media Assistant</strong> to help manage our online presence across multiple platforms.</p><h3>Key Responsibilities</h3><ul><li>Create and schedule engaging social media content</li><li>Monitor analytics and report on campaign performance</li><li>Respond to comments and messages in a timely manner</li><li>Collaborate with the marketing team on brand strategies</li></ul><h3>Requirements</h3><ul><li>1+ years of experience managing social media accounts</li><li>Excellent written communication skills</li><li>Familiarity with social media management tools</li></ul>',
    applicants: [
      {
        id: '1',
        name: 'Alice Johnson',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        appliedDate: '2020-05-21',
        score: 8.2,
        hiringStage: 'Hired',
      },
      {
        id: '2',
        name: 'Bob Smith',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        appliedDate: '2020-05-22',
        score: 6.7,
        hiringStage: 'Declined',
      },
      {
        id: '3',
        name: 'Carol Lee',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        appliedDate: '2020-05-23',
        score: 8.5,
        hiringStage: 'Interviewed',
      },
      {
        id: '4',
        name: 'Ethan Park',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
        appliedDate: '2020-05-23',
        score: 6.9,
        hiringStage: 'Shortlisted',
      },
      {
        id: '5',
        name: 'Fatima Al-Hassan',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        appliedDate: '2020-05-24',
        score: 8.1,
        hiringStage: 'In Review',
      },
      {
        id: '6',
        name: 'George Chen',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
        appliedDate: '2020-05-24',
        score: 6.4,
        hiringStage: 'Declined',
      },
      {
        id: '7',
        name: 'Hannah Müller',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah',
        appliedDate: '2020-05-25',
        score: 8.7,
        hiringStage: 'Hired',
      },
      {
        id: '8',
        name: 'Ivan Petrov',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
        appliedDate: '2020-05-25',
        score: 6.2,
        hiringStage: 'Declined',
      },
      {
        id: '9',
        name: 'Jessica Okafor',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
        appliedDate: '2020-05-26',
        score: 8.0,
        hiringStage: 'Interviewed',
      },
      {
        id: '10',
        name: 'Kevin Tanaka',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
        appliedDate: '2020-05-26',
        score: 3.8,
        hiringStage: 'Shortlisted',
      },
      {
        id: '11',
        name: 'Laura Martínez',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
        appliedDate: '2020-05-27',
        score: 4.3,
        hiringStage: 'Interviewed',
      },
      {
        id: '12',
        name: 'Marcus Williams',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        appliedDate: '2020-05-27',
        score: 3.5,
        hiringStage: 'In Review',
      },
      {
        id: '13',
        name: 'Nina Johansson',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
        appliedDate: '2020-05-28',
        score: 8.6,
        hiringStage: 'Shortlisted',
      },
      {
        id: '14',
        name: 'Omar Farouk',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
        appliedDate: '2020-05-28',
        score: 6.1,
        hiringStage: 'Declined',
      },
      {
        id: '15',
        name: 'Priya Sharma',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        appliedDate: '2020-05-29',
        score: 7.4,
        hiringStage: 'In Review',
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Senior Designer',
    status: 'Live',
    employmentType: 'Full-time',
    workModel: 'hybrid',
    category: 'design',
    salaryCurrency: 'usd',
    salaryMin: '80000',
    salaryMax: '120000',
    skills: ['Figma', 'UI/UX', 'Typography', 'Design Systems', 'Prototyping'],
    datePosted: '2020-05-16',
    dateClosed: null,
    description:
      '<h2>About the Role</h2><p>Join our design team as a <strong>Senior Designer</strong> to lead visual projects and mentor junior designers.</p><h3>Key Responsibilities</h3><ul><li>Lead end-to-end design for major product features</li><li>Establish and maintain design systems and guidelines</li><li>Conduct user research and usability testing</li><li>Mentor and provide feedback to junior team members</li></ul><h3>Qualifications</h3><ul><li>5+ years of professional design experience</li><li>Strong portfolio demonstrating UI/UX expertise</li><li>Proficiency in Figma and prototyping tools</li></ul><blockquote><p>We offer a creative and collaborative work environment with flexible hours.</p></blockquote>',
    applicants: [
      {
        id: '3',
        name: 'Carol Lee',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        appliedDate: '2020-05-17',
        score: 7.8,
        hiringStage: 'Shortlisted',
      },
    ],
  },
};
