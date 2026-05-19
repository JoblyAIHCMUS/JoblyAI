import { z } from 'zod';
import type { EmploymentType } from '@/types/job';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/lib/employment-type-config';

/**
 * Zod schema for personal details form validation
 */
export const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  phoneNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^\+?\d+$/.test(val),
      'Phone number must contain only digits or start with + followed by digits'
    ),
  email: z.string().optional(), // Email is read-only, not editable
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      if (!val) return true;
      const dob = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      return dob <= today;
    }, 'Date of birth cannot be in the future'),
  gender: z.string().min(1, 'Gender is required'),
});

export type PersonalDetailsFormData = z.infer<typeof PersonalDetailsSchema>;

/**
 * Format a date to YYYY-MM-DD string format
 * Safe handling for Date objects and strings
 */
export function formatDateToYYYYMMDD(
  date: Date | string | null | undefined
): string {
  if (!date) return '';

  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }
    return parsedDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(
  dateString: string | null | undefined
): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

/**
 * Zod schema for education form validation with real-time validation
 */
import type { Degree } from '@/types/candidate';
export const DEGREE_OPTIONS: Degree[] = [
  'HIGH_SCHOOL',
  'DIPLOMA',
  'ASSOCIATE',
  'BACHELOR',
  'MASTER',
  'PHD',
  'OTHER',
];

export const DEGREE_MAP: Record<Degree, string> = {
  PHD: 'PhD',
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  ASSOCIATE: 'Associate',
  DIPLOMA: 'Diploma',
  HIGH_SCHOOL: 'High School',
  OTHER: 'Other',
};

/**
 * Converts degree enum to display label
 * @example
 * formatDegree('BACHELOR') // => "Bachelor's"
 */
export function formatDegree(degree?: string): string {
  return degree ? DEGREE_MAP[degree as Degree] ?? degree : '';
}

export const createEducationSchema = () => {
  return z
    .object({
      school: z.string().min(1, 'School name is required').trim(),
      degree: z
        .enum(DEGREE_OPTIONS as [Degree, ...Degree[]])
        .optional()
        .refine((val) => val !== undefined, {
          message: 'Degree is required',
        }),
      fieldOfStudy: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (val) => !val || val.length >= 2,
          'Field of study must be at least 2 characters'
        ),
      startDate: z
        .date({
          error: 'Start date is required',
        })
        .refine((date) => date <= new Date(), {
          message: 'Start date cannot be in the future',
        }),
      isCurrent: z.boolean(),
      endDate: z.date().nullable(),
      grade: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (val) => !val || /^([0-4](\.\d{1,2})?|4(\.0{1,2})?)$/.test(val),
          'Grade must be between 0 and 4 (GPA format)'
        ),
      description: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (val) => !val || val.length <= 500,
          'Description must not exceed 500 characters'
        ),
    })
    .superRefine((data, ctx) => {
      if (!data.isCurrent && !data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'End date is required when not currently studying',
        });
      }

      const startDate = data.startDate;
      if (startDate && data.endDate && data.endDate < startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'End date cannot be before start date',
        });
      }
    });
};

export const EducationSchema = createEducationSchema();
export type EducationFormData = z.infer<typeof EducationSchema>;

/**
 * Zod schema for experience form validation with real-time validation
 */
export const createExperienceSchema = () => {
  const employmentTypes = EMPLOYMENT_TYPE_OPTIONS.map(
    (option) => option.value
  ) as [EmploymentType, ...EmploymentType[]];

  return z
    .object({
      jobTitle: z.string().min(1, 'Job title is required').trim(),
      companyName: z.string().min(1, 'Company name is required').trim(),
      type: z
        .enum(employmentTypes)
        .optional()
        .refine((val) => val !== undefined, {
          message: 'Employment type is required',
        }),
      location: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (val) => !val || val.length <= 200,
          'Location must be less than 200 characters'
        ),
      startDate: z
        .date({
          error: 'Start date is required',
        })
        .refine((date) => date <= new Date(), {
          message: 'Start date cannot be in the future',
        }),
      isCurrent: z.boolean(),
      endDate: z.date().nullable(),
      description: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (val) => !val || val.length <= 1000,
          'Description must not exceed 1000 characters'
        ),
    })
    .superRefine((data, ctx) => {
      if (!data.isCurrent && !data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'End date is required when not currently working',
        });
      }

      const startDate = data.startDate;
      if (startDate && data.endDate && data.endDate < startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'End date cannot be before start date',
        });
      }
    });
};

export const ExperienceSchema = createExperienceSchema();
export type ExperienceFormData = z.infer<typeof ExperienceSchema>;

/**
 * Zod schema for certificate form validation
 */
export const createCertificateSchema = () => {
  return z
    .object({
      name: z.string().min(1, 'Certificate name is required').trim(),
      issuer: z.string().min(1, 'Issuer name is required').trim(),
      issueDate: z
        .date({
          error: 'Issue date is required',
        })
        .refine((date) => date <= new Date(), {
          message: 'Issue date cannot be in the future',
        }),
      hasExpiry: z.boolean().default(false),
      expiryDate: z.date().nullable(),
      credentialId: z.string().optional().or(z.literal('')),
      url: z.string().url('Invalid URL format').optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      if (data.hasExpiry && !data.expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expiryDate'],
          message: 'Expiry date is required',
        });
      }

      if (
        data.issueDate &&
        data.expiryDate &&
        data.expiryDate < data.issueDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expiryDate'],
          message: 'Expiry date cannot be before issue date',
        });
      }
    });
};

export const CertificateSchema = createCertificateSchema();
export type CertificateFormData = z.infer<typeof CertificateSchema>;

/**
 * Zod schema for submit application form validation
 */
export const SubmitApplicationSchema = z.object({
  jobTitle: z
    .string()
    .max(200, 'Job title must be less than 200 characters')
    .default(''),
  coverLetter: z
    .string()
    .max(1000, 'Cover letter must be less than 1000 characters')
    .default(''),
  resume: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'Resume must be less than 5MB'
    )
    .refine(
      (file) =>
        !file ||
        [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(file.type),
      'Resume must be a PDF or Word document'
    ),
});

export type SubmitApplicationFormData = z.infer<typeof SubmitApplicationSchema>;
