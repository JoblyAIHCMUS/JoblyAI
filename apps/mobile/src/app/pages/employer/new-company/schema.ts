import * as yup from 'yup';
import { checkCompanyNameExists } from '../../../../api/company';

// Helper function to validate website URL has proper domain format
const isValidWebsiteDomain = (url: string | undefined): boolean => {
  if (!url) return true; // Optional field
  try {
    // Add https:// if no protocol is provided
    const urlToValidate = /^https?:\/\//.test(url) ? url : `https://${url}`;
    const urlObj = new URL(urlToValidate);
    // Check that the hostname contains at least one dot (for TLD)
    // Accept localhost for testing but require proper domain for others
    const hostname = urlObj.hostname;
    return hostname === 'localhost' || hostname.includes('.');
  } catch {
    return false;
  }
};

const INDUSTRIES = [
  'technology',
  'finance',
  'healthcare',
  'education',
  'retail',
  'manufacturing',
  'media',
  'consulting',
  'real-estate',
  'transportation',
  'hospitality',
  'agriculture',
  'construction',
  'energy',
  'government',
  'insurance',
  'legal',
  'logistics',
  'marketing',
  'nonprofit',
  'pharmaceutical',
  'telecommunications',
  'aerospace',
  'automotive',
  'biotechnology',
  'chemical',
  'environmental',
  'food-beverage',
  'fashion',
  'mining',
  'sports',
  'veterinary',
  'artificial-intelligence',
  'cleantech',
  'crypto-blockchain',
  'cybersecurity',
  'ecommerce',
  'edtech',
  'fintech',
  'gaming',
  'healthtech',
  'proptech',
  'saas',
  'social-media',
  'space',
  'other',
];

export const companyRegistrationSchema = yup.object().shape({
  companyName: yup
    .string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters long')
    .max(255, 'Company name cannot exceed 255 characters')
    .matches(
      /^[a-zA-Z0-9\s\-&.,()]+$/,
      'Company name can only contain letters, numbers, spaces, and the following characters: - & . , ( )'
    )
    .test(
      'unique-company-name',
      'A company with this name already exists',
      async (value) => {
        if (!value) return true;
        try {
          const exists = await checkCompanyNameExists(value);
          return !exists;
        } catch {
          return true; // Allow on error
        }
      }
    ),
  website: yup
    .string()
    .default('')
    .test(
      'valid-website',
      'Please enter a valid website URL with a proper domain (e.g., example.com, www.example.com, or https://www.example.com)',
      (value) => isValidWebsiteDomain(value)
    ),
  scale: yup
    .string()
    .required('Company size is required')
    .oneOf(
      [
        '1-50',
        '51-100',
        '101-250',
        '251-500',
        '501-1000',
        '1001-5000',
        '5001+',
      ],
      'Please select a valid company size'
    ),
  industry: yup
    .string()
    .required('Industry is required')
    .oneOf(INDUSTRIES, 'Please select a valid industry'),
  companyDescription: yup
    .string()
    .default('')
    .test('not-empty-text', 'Company description cannot be empty', (value) => {
      if (!value) return true;
      const trimmed = value.trim();
      return trimmed.length > 0;
    }),
  logoUrl: yup.string().nullable().default(null),
}) as any;

export type CompanyRegistrationFormData = {
  companyName: string;
  website?: string;
  scale: string;
  industry: string;
  companyDescription?: string;
  logoUrl: string | null;
};
