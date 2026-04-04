// Centralized constants for company profile display
export const SCALE_LABELS: Record<string, string> = {
  '1-50': '1 - 50',
  '51-100': '51 - 100',
  '101-250': '101 - 250',
  '251-500': '251 - 500',
  '501-1000': '501 - 1,000',
  '1001-5000': '1,001 - 5,000',
  '5001+': '5,001+',
  // fallback for custom values
};

export const INDUSTRY_LABELS: Record<string, string> = {
  // Common
  technology: 'Technology',
  finance: 'Finance',
  healthcare: 'Healthcare',
  education: 'Education',
  retail: 'Retail',
  manufacturing: 'Manufacturing',
  media: 'Media',
  consulting: 'Consulting',
  'real-estate': 'Real Estate',
  transportation: 'Transportation',
  hospitality: 'Hospitality',

  // Broad / General
  agriculture: 'Agriculture',
  construction: 'Construction',
  energy: 'Energy & Utilities',
  government: 'Government & Public Sector',
  insurance: 'Insurance',
  legal: 'Legal',
  logistics: 'Logistics & Supply Chain',
  marketing: 'Marketing & Advertising',
  nonprofit: 'Non-Profit & NGO',
  pharmaceutical: 'Pharmaceutical',
  telecommunications: 'Telecommunications',

  // Niche / Specialized
  aerospace: 'Aerospace & Defense',
  automotive: 'Automotive',
  biotechnology: 'Biotechnology',
  chemical: 'Chemical',
  environmental: 'Environmental & Sustainability',
  'food-beverage': 'Food & Beverage',
  fashion: 'Fashion & Apparel',
  mining: 'Mining & Resources',
  sports: 'Sports & Recreation',
  veterinary: 'Veterinary & Animal Care',

  // Emerging / Modern
  'artificial-intelligence': 'Artificial Intelligence',
  cleantech: 'Clean Energy & CleanTech',
  'crypto-blockchain': 'Crypto & Blockchain',
  cybersecurity: 'Cybersecurity',
  ecommerce: 'E-Commerce',
  edtech: 'EdTech',
  fintech: 'FinTech',
  gaming: 'Gaming & Esports',
  healthtech: 'HealthTech',
  proptech: 'PropTech',
  saas: 'SaaS',
  'social-media': 'Social Media',
  space: 'Space Technology',

  other: 'Other',
  // fallback for custom values
};
