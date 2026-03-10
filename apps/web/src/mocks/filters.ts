import { FilterGroupData } from '@/types/job';

export const FILTER_GROUPS: FilterGroupData[] = [
  {
    title: 'Type of Employment',
    items: [
      { label: 'Full-time', count: 3 },
      { label: 'Part-Time', count: 5 },
      { label: 'Remote', count: 2 },
      { label: 'Internship', count: 24 },
      { label: 'Contract', count: 3 },
    ],
    checked: [],
  },
  {
    title: 'Categories',
    items: [
      { label: 'Design', count: 24 },
      { label: 'Sales', count: 3 },
      { label: 'Marketing', count: 3 },
      { label: 'Business', count: 3 },
      { label: 'Human Resource', count: 6 },
      { label: 'Finance', count: 4 },
      { label: 'Engineering', count: 4 },
      { label: 'Technology', count: 5 },
    ],
    checked: ['Business', 'Technology'],
  },
  {
    title: 'Job Level',
    items: [
      { label: 'Entry Level', count: 57 },
      { label: 'Mid Level', count: 3 },
      { label: 'Senior Level', count: 5 },
      { label: 'Director', count: 12 },
      { label: 'VP or Above', count: 8 },
    ],
    checked: ['Director'],
  },
  {
    title: 'Salary Range',
    items: [
      { label: '$700 - $1000', count: 4 },
      { label: '$100 - $1500', count: 6 },
      { label: '$1500 - $2000', count: 10 },
      { label: '$3000 or above', count: 4 },
    ],
    checked: ['$3000 or above'],
  },
];
