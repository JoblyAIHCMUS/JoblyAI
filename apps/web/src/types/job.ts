export type ViewMode = 'grid' | 'list';

export interface FilterItem {
  label: string;
}

export interface FilterGroupData {
  title: string;
  items: FilterItem[];
  checked: string[];
}

export interface Job {
  companyName: string;
  title: string;
  location: string;
  logoUrl: string;
}
