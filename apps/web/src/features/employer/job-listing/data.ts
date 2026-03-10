export type JobListingStatus = 'Draft' | 'Live' | 'Closed';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Freelance';

export interface JobListing {
  id: string;
  title: string;
  status: JobListingStatus;
  datePosted: string;
  dateClosed: string | null;
  employmentType: EmploymentType;
  applicants: number;
}

export const jobListings: JobListing[] = [
  {
    id: '1',
    title: 'Social Media Assistant',
    status: 'Live',
    datePosted: '20 May 2020',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 19,
  },
  {
    id: '2',
    title: 'Senior Designer',
    status: 'Live',
    datePosted: '16 May 2020',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 1234,
  },
  {
    id: '3',
    title: 'Visual Designer',
    status: 'Live',
    datePosted: '15 May 2020',
    dateClosed: null,
    employmentType: 'Freelance',
    applicants: 2435,
  },
  {
    id: '4',
    title: 'Data Scientist',
    status: 'Closed',
    datePosted: '13 May 2020',
    dateClosed: '24 May 2020',
    employmentType: 'Freelance',
    applicants: 6234,
  },
  {
    id: '5',
    title: 'Kotlin Developer',
    status: 'Closed',
    datePosted: '12 May 2020',
    dateClosed: '24 May 2020',
    employmentType: 'Full-time',
    applicants: 12,
  },
  {
    id: '6',
    title: 'React Developer',
    status: 'Closed',
    datePosted: '11 May 2020',
    dateClosed: '24 May 2020',
    employmentType: 'Full-time',
    applicants: 14,
  },
  {
    id: '7',
    title: 'Kotlin Developer',
    status: 'Closed',
    datePosted: '12 May 2020',
    dateClosed: '24 May 2020',
    employmentType: 'Full-time',
    applicants: 12,
  },
  {
    id: '8',
    title: 'Product Manager',
    status: 'Draft',
    datePosted: '10 May 2020',
    dateClosed: null,
    employmentType: 'Part-time',
    applicants: 0,
  },
  {
    id: '9',
    title: 'Backend Engineer',
    status: 'Live',
    datePosted: '9 May 2020',
    dateClosed: null,
    employmentType: 'Contract',
    applicants: 87,
  },
  {
    id: '10',
    title: 'Marketing Intern',
    status: 'Draft',
    datePosted: '8 May 2020',
    dateClosed: null,
    employmentType: 'Internship',
    applicants: 0,
  },
  {
    id: '11',
    title: 'DevOps Engineer',
    status: 'Live',
    datePosted: '7 May 2020',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 53,
  },
  {
    id: '12',
    title: 'UX Researcher',
    status: 'Closed',
    datePosted: '5 May 2020',
    dateClosed: '20 May 2020',
    employmentType: 'Contract',
    applicants: 340,
  },
  {
    id: '13',
    title: 'QA Analyst',
    status: 'Live',
    datePosted: '4 May 2020',
    dateClosed: null,
    employmentType: 'Part-time',
    applicants: 27,
  },
  {
    id: '14',
    title: 'iOS Developer',
    status: 'Draft',
    datePosted: '3 May 2020',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 0,
  },
  {
    id: '15',
    title: 'Content Strategist',
    status: 'Closed',
    datePosted: '1 May 2020',
    dateClosed: '18 May 2020',
    employmentType: 'Freelance',
    applicants: 189,
  },
];
