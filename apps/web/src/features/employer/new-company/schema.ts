import { z } from 'zod';
import { checkCompanyNameExists } from '@/api-client/company';

// Helper function to validate HTML content is not empty
const isHtmlContentEmpty = (html: string): boolean => {
  if (!html) return true;

  // In a browser environment, use DOM parsing to robustly extract text content
  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = html;
    const rawText = container.textContent ?? container.innerText ?? '';
    const normalizedText = rawText.replace(/\u00A0/g, ' ').trim();
    return normalizedText === '';
  }

  // Fallback: strip tags and handle non-breaking spaces if DOM is unavailable
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text === '';
};

export const companyRegistrationSchema = z
  .object({
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters long')
      .max(255, 'Company name cannot exceed 255 characters')
      .trim()
      .refine(
        (name) => /^[a-zA-Z0-9\s\-&.,()]+$/.test(name),
        'Company name can only contain letters, numbers, spaces, and the following characters: - & . , ( )'
      )
      .refine(async (name) => {
        const exists = await checkCompanyNameExists(name);
        return !exists;
      }, 'A company with this name already exists'),
    website: z
      .string()
      .optional()
      .refine((url) => {
        if (!url) return true; // Optional field
        try {
          // Add https:// if no protocol is provided
          const urlToValidate = /^https?:\/\//.test(url)
            ? url
            : `https://${url}`;
          new URL(urlToValidate);
          return true;
        } catch {
          return false;
        }
      }, 'Please enter a valid website URL (e.g., example.com, www.example.com, or https://www.example.com)'),
    scale: z
      .enum([
        '1-50',
        '51-100',
        '101-250',
        '251-500',
        '501-1000',
        '1001-5000',
        '5001+',
      ])
      .optional(),
    industry: z
      .string()
      .refine(
        (industry) =>
          industry === '' ||
          [
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
          ].includes(industry),
        'Please select a valid industry'
      )
      .optional(),
    companyDescription: z
      .string()
      .optional()
      .refine(
        (description) => !description || !isHtmlContentEmpty(description),
        'Company description cannot be empty'
      ),
    logoUrl: z.string().optional().nullable(),
  })
  .strict();

export type CompanyRegistrationFormData = z.infer<
  typeof companyRegistrationSchema
>;
