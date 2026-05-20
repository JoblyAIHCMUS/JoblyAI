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
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'construction', label: 'Construction' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'government', label: 'Government & Public Sector' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal' },
  { value: 'logistics', label: 'Logistics & Supply Chain' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'nonprofit', label: 'Non-Profit & NGO' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'aerospace', label: 'Aerospace & Defense' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'biotechnology', label: 'Biotechnology' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'environmental', label: 'Environmental & Sustainability' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion & Apparel' },
] as const;

export const COMPANY_SIZE_OPTIONS = SCALES;
export const COMPANY_INDUSTRY_OPTIONS = INDUSTRIES;
