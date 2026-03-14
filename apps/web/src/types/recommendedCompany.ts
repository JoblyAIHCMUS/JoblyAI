export type BadgeTone = 'orange-outline' | 'orange-soft' | 'indigo-soft';

export interface CompanyTag {
  id: string;
  label: string;
  tone: BadgeTone;
}

export interface RecommendedCompany {
  id: string;
  name: string;
  jobs: number;
  description: string;
  logo: {
    imageUrl: string;
    alt: string;
    rounded?: 'full' | 'square';
  };
  tag: CompanyTag;
}
