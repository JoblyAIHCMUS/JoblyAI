export interface Company {
  id: number;
  name: string;
  slug: string;
  websiteUrl: string | null;
  sizeRange: string | null;
  industry: string | null;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
