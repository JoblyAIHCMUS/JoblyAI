export const NEW_COMPANY_STEPS = [
  { id: 'overview', label: 'Overview' },
  { id: 'about', label: 'About Company' },
  { id: 'team', label: 'Team' },
] as const;

export const SCALES = [
  { value: '1-50', label: '1 - 50' },
  { value: '51-100', label: '51 - 100' },
  { value: '101-250', label: '101 - 250' },
  { value: '251-500', label: '251 - 500' },
  { value: '501-1000', label: '501 - 1,000' },
  { value: '1001-5000', label: '1,001 - 5,000' },
  { value: '5001+', label: '5,001+' },
] as const;

export const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'media', label: 'Media' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
] as const;
