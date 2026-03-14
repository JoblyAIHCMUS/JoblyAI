import type { JobDetail, JobDetailPageData } from '@/types/jobDetail';

export const JOB_DETAIL_MOCK: JobDetail = {
  description: JSON.stringify({
    overview:
      'Stripe is looking for Social Media Marketing expert to help manage our online networks. You will be responsible for monitoring our social media channels, creating content, finding effective ways to engage the community and incentivize others to engage on our channels.',
    responsibilities: [
      'Community engagement to ensure that is supported and actively represented online',
      'Focus on social media content development and publication',
      'Marketing and strategy support',
      'Stay on top of trends on social media platforms, and suggest content ideas to the team',
      'Engage with online communities',
    ],
    whoYouAre: [
      'You get energy from people and building the ideal work environment',
      'You have a sense for beautiful spaces and office experiences',
      'You are a confident office manager, ready for added responsibilities',
      "You're detail-oriented and creative",
      "You're a growth marketer and know how to run campaigns",
    ],
    niceToHaves: [
      'Fluent in English',
      'Project management skills',
      'Copy editing skills',
    ],
  }),
  aboutRole: {
    appliedCount: 5,
    capacity: 10,
    applyBefore: 'July 31, 2021',
    postedOn: 'July 1, 2021',
    jobType: 'Full-Time',
    salary: {
      min: 75000,
      max: 85000,
      currency: 'USD',
    },
  },
  category: {
    label: 'Marketing',
    color: 'orange',
  },
  requiredSkills: [
    'Project Management',
    'Copywriting',
    'Social Media Marketing',
    'English',
    'Copy Editing',
  ],
};

export const JOB_DETAIL_PAGE_DATA_MOCK: JobDetailPageData = {
  jobId: 'job-001',
  breadcrumbItems: [
    { label: 'Home', href: '/' },
    { label: 'Companies', href: '/companies' },
    { label: 'Nomad', href: '/companies/nomad' },
    { label: 'Social Media Assistant' },
  ],
  jobName: 'Social Media Assistant',
  companyName: 'Stripe',
  address: 'Paris, France',
  workType: 'Full-Time',
  logoUrl:
    'https://www.figma.com/api/mcp/asset/8a2b3230-c7d8-4f71-b19a-b7e084c79338',
  companyDescription:
    'Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size-from new startups to public companies-use our software to accept payments and manage their businesses online.',
  companyPhotos: [
    'https://www.figma.com/api/mcp/asset/afec218c-2114-40e7-aa6d-9b58fc4e35fe',
    'https://www.figma.com/api/mcp/asset/a796abdb-c2c3-456f-b7fa-3db8e7e6823e',
    'https://www.figma.com/api/mcp/asset/e831bd13-f785-4e83-829d-6cc815c243e2',
    'https://www.figma.com/api/mcp/asset/f0e67881-0a37-4563-80b1-9c943b64caf1',
  ],
  companyPageUrl: '/companies/nomad',
};
