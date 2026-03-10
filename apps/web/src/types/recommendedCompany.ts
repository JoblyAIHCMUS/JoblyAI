export type BadgeTone = 'orange-outline' | 'orange-soft' | 'indigo-soft';

export interface CompanyTag {
  label: string;
  tone: BadgeTone;
}

export interface RecommendedCompany {
  name: string;
  jobs: string;
  description: string;
  logo: {
    imageUrl: string;
    alt: string;
    rounded?: 'full' | 'square';
  };
  tags: CompanyTag[];
}
