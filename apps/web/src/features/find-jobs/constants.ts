import type { FilterGroupData, SortOption } from '@/types/job';

export const SORT_OPTIONS: SortOption[] = [
  'Most relevant',
  'Newest',
  'Oldest',
  'Highest salary',
  'Lowest salary',
];

export const FILTER_GROUPS: FilterGroupData[] = [
  {
    title: 'Type of Employment',
    items: [
      { label: 'Full-time' },
      { label: 'Part-Time' },
      { label: 'Internship' },
      { label: 'Contract' },
      { label: 'Freelance' },
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
    checked: [],
  },
];

export const SALARY_MAX_CAP = 200_000;
export const PAGE_SIZE = 5;
