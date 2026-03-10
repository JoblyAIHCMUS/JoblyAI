export type ViewMode = 'grid' | 'list';

export interface FilterItem {
  label: string;
  count: number;
}

export interface FilterGroupData {
  title: string;
  items: FilterItem[];
  checked: string[];
}

export interface Job {
  company: string;
  title: string;
  location: string;
  logo: string;
  tone: string;
}
