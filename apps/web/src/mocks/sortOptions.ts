export const SORT_OPTIONS = ['Most relevant', 'Newest', 'Oldest', 'Highest salary', 'Lowest salary'] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
