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

export const jobPostingSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Job title must be at least 2 characters long')
      .max(255, 'Job title cannot exceed 255 characters')
      .trim(),
    description: z
      .string()
      .refine(
        (description) => !isHtmlContentEmpty(description),
        'Job description is required and cannot be empty'
      ),
    type: z
      .enum([
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'INTERNSHIP',
        'FREELANCE',
        'OTHER',
      ])
      .refine(
        (value) => value !== undefined && value !== null,
        'Please select a valid employment type'
      ),
    remote: z.boolean(),
    location: z.string().optional(),
    categoryId: z.string().min(1, 'Please select a category'),
    currency: z.enum(['none', 'usd', 'eur', 'gbp', 'vnd', 'jpy', 'cny']),
    salaryMin: z
      .number()
      .nonnegative('Salary must be non-negative')
      .nullable()
      .optional(),
    salaryMax: z
      .number()
      .nonnegative('Salary must be non-negative')
      .nullable()
      .optional(),
    skills: z.array(
      z.object({
        name: z.string().min(1, 'Skill name is required'),
        importance: z.enum(['REQUIRED', 'PREFERRED', 'OPTIONAL']),
        minYearsExperience: z.number().nonnegative().optional(),
      })
    ),
    preShortlistThreshold: z
      .number()
      .min(0, 'Threshold must be between 0 and 100')
      .max(100, 'Threshold must be between 0 and 100'),
    preShortlistQuestions: z.array(
      z
        .string()
        .min(5, 'Each question must be at least 5 characters')
        .max(500, 'Each question must be at most 500 characters')
    ),
  })
  .refine(
    (data) => {
      // If not remote, location must be provided
      if (!data.remote && !data.location?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Location is required when not a remote position',
      path: ['location'],
    }
  )
  .refine(
    (data) => {
      // If currency is selected and salaryMin is provided, it should be valid
      // If salaryMax is also provided, salaryMin must be <= salaryMax
      if (
        data.currency !== 'none' &&
        data.salaryMin !== undefined &&
        data.salaryMin !== null &&
        data.salaryMax !== undefined &&
        data.salaryMax !== null
      ) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'Minimum salary must be less than or equal to maximum salary',
      path: ['salaryMin'],
    }
  )
  .refine(
    (data) => {
      // Check the same condition but report error on salaryMax
      if (
        data.currency !== 'none' &&
        data.salaryMin !== undefined &&
        data.salaryMin !== null &&
        data.salaryMax !== undefined &&
        data.salaryMax !== null
      ) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['salaryMax'],
    }
  )
  .strict();

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;
