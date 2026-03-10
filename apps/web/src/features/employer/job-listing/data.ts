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
    datePosted: '2020-05-20',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 19,
  },
  {
    id: '2',
    title: 'Senior Designer',
    status: 'Live',
    datePosted: '2020-05-16',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 1234,
  },
  {
    id: '3',
    title: 'Visual Designer',
    status: 'Live',
    datePosted: '2020-05-15',
    dateClosed: null,
    employmentType: 'Freelance',
    applicants: 2435,
  },
  {
    id: '4',
    title: 'Data Scientist',
    status: 'Closed',
    datePosted: '2020-05-13',
    dateClosed: '2020-05-24',
    employmentType: 'Freelance',
    applicants: 6234,
  },
  {
    id: '5',
    title: 'Kotlin Developer',
    status: 'Closed',
    datePosted: '2020-05-12',
    dateClosed: '2020-05-24',
    employmentType: 'Full-time',
    applicants: 12,
  },
  {
    id: '6',
    title: 'React Developer',
    status: 'Closed',
    datePosted: '2020-05-11',
    dateClosed: '2020-05-24',
    employmentType: 'Full-time',
    applicants: 14,
  },
  {
    id: '7',
    title: 'Kotlin Developer',
    status: 'Closed',
    datePosted: '2020-05-12',
    dateClosed: '2020-05-24',
    employmentType: 'Full-time',
    applicants: 12,
  },
  {
    id: '8',
    title: 'Product Manager',
    status: 'Draft',
    datePosted: '2020-05-10',
    dateClosed: null,
    employmentType: 'Part-time',
    applicants: 0,
  },
  {
    id: '9',
    title: 'Backend Engineer',
    status: 'Live',
    datePosted: '2020-05-09',
    dateClosed: null,
    employmentType: 'Contract',
    applicants: 87,
  },
  {
    id: '10',
    title: 'Marketing Intern',
    status: 'Draft',
    datePosted: '2020-05-08',
    dateClosed: null,
    employmentType: 'Internship',
    applicants: 0,
  },
  {
    id: '11',
    title: 'DevOps Engineer',
    status: 'Live',
    datePosted: '2020-05-07',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 53,
  },
  {
    id: '12',
    title: 'UX Researcher',
    status: 'Closed',
    datePosted: '2020-05-05',
    dateClosed: '2020-05-20',
    employmentType: 'Contract',
    applicants: 340,
  },
  {
    id: '13',
    title: 'QA Analyst',
    status: 'Live',
    datePosted: '2020-05-04',
    dateClosed: null,
    employmentType: 'Part-time',
    applicants: 27,
  },
  {
    id: '14',
    title: 'iOS Developer',
    status: 'Draft',
    datePosted: '2020-05-03',
    dateClosed: null,
    employmentType: 'Full-time',
    applicants: 0,
  },
  {
    id: '15',
    title: 'Content Strategist',
    status: 'Closed',
    datePosted: '2020-05-01',
    dateClosed: '2020-05-18',
    employmentType: 'Freelance',
    applicants: 189,
  },
];
