import { z } from 'zod';

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

export const companyUpdateSchema = z
  .object({
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters long')
      .max(255, 'Company name cannot exceed 255 characters')
      .trim()
      .refine(
        (name) => /^[a-zA-Z0-9\s\-&.,()]+$/.test(name),
        'Company name can only contain letters, numbers, spaces, and the following characters: - & . , ( )'
      ),
    website: z
      .string()
      .optional()
      .refine(
        (url) => isValidWebsiteDomain(url),
        'Please enter a valid website URL with a proper domain (e.g., example.com, www.example.com, or https://www.example.com)'
      ),
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
    location: z
      .object({
        id: z.string().optional(),
        provider: z.string(),
        providerId: z.string(),
        formattedAddress: z.string(),
        lat: z.number(),
        lng: z.number(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        postcode: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    locations: z
      .array(
        z.object({
          id: z.string().optional(),
          provider: z.string(),
          providerId: z.string(),
          formattedAddress: z.string(),
          lat: z.number(),
          lng: z.number(),
          city: z.string().nullable().optional(),
          state: z.string().nullable().optional(),
          country: z.string().nullable().optional(),
          postcode: z.string().nullable().optional(),
        })
        .nullable()
      )
      .optional(),
    logoUrl: z.string().optional().nullable(),
    images: z
      .array(z.string().url('Invalid image URL'))
      .max(5, 'Maximum of 5 company images')
      .optional(),
  })
  .strict();

export type CompanyUpdateFormData = z.infer<typeof companyUpdateSchema>;
