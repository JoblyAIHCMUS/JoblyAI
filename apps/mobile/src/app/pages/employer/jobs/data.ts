export type JobStatus = 'Live' | 'Closed' | 'Draft';
export type JobType = 'Fulltime' | 'Freelance' | 'Part-time';

export interface JobListing {
  id: string;
  title: string;
  datePosted: string;
  applicants: number;
  needsFilled: number;
  needsTotal: number;
  status: JobStatus;
  type: JobType;
}

export const MOCK_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Social Media Specialist',
    datePosted: '24 July 2021',
    applicants: 19,
    needsFilled: 4,
    needsTotal: 11,
    status: 'Live',
    type: 'Fulltime'
  },
  {
    id: '2',
    title: 'Senior Product Designer',
    datePosted: '24 July 2021',
    applicants: 19,
    needsFilled: 4,
    needsTotal: 11,
    status: 'Live',
    type: 'Fulltime'
  },
  {
    id: '3',
    title: 'Visual Designer',
    datePosted: '24 July 2021',
    applicants: 19,
    needsFilled: 4,
    needsTotal: 11,
    status: 'Live',
    type: 'Freelance'
  },
  {
    id: '4',
    title: 'Data Science',
    datePosted: '24 July 2021',
    applicants: 19,
    needsFilled: 4,
    needsTotal: 4,
    status: 'Closed',
    type: 'Freelance'
  },
  {
    id: '5',
    title: 'Kotlin Developer',
    datePosted: '24 July 2021',
    applicants: 19,
    needsFilled: 3,
    needsTotal: 3,
    status: 'Closed',
    type: 'Freelance'
  }
];
