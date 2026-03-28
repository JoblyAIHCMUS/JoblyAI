import { FilterGroupData } from '@/types/job';

export const FILTER_GROUPS: FilterGroupData[] = [
  {
    title: 'Type of Employment',
    items: [
      { label: 'Full-time' },
      { label: 'Part-Time' },
      { label: 'Remote' },
      { label: 'Internship' },
      { label: 'Contract' },
    ],
    checked: [],
  },
  {
    title: 'Categories',
    items: [
      { label: 'Design' },
      { label: 'Sales' },
      { label: 'Marketing' },
      { label: 'Business' },
      { label: 'Human Resource' },
      { label: 'Finance' },
      { label: 'Engineering' },
      { label: 'Technology' },
    ],
    checked: ['Business', 'Technology'],
  },
  {
    title: 'Job Level',
    items: [
      { label: 'Entry Level' },
      { label: 'Mid Level' },
      { label: 'Senior Level' },
      { label: 'Director' },
      { label: 'VP or Above' },
    ],
    checked: ['Director'],
  },
  {
    title: 'Salary Range',
    items: [
      { label: '$700 - $1000' },
      { label: '$100 - $1500' },
      { label: '$1500 - $2000' },
      { label: '$3000 or above' },
    ],
    checked: ['$3000 or above'],
  },
];
