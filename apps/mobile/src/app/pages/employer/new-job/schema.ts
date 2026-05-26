import * as yup from 'yup';

// Helper function to validate HTML content is not empty
const isHtmlContentEmpty = (html: string): boolean => {
  if (!html) return true;

  // Strip tags and handle non-breaking spaces
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text === '';
};

export const jobPostingSchema = yup
  .object({
    title: yup
      .string()
      .min(2, 'Job title must be at least 2 characters long')
      .max(255, 'Job title cannot exceed 255 characters')
      .required('Job title is required'),
    description: yup
      .string()
      .required('Job description is required')
      .test(
        'not-empty-html',
        'Job description is required and cannot be empty',
        (value) => !isHtmlContentEmpty(value)
      ),
    type: yup
      .string()
      .oneOf(
        [
          'FULL_TIME',
          'PART_TIME',
          'CONTRACT',
          'INTERNSHIP',
          'FREELANCE',
          'OTHER',
        ],
        'Please select a valid employment type'
      )
      .required('Please select an employment type'),
    remote: yup.boolean().required('Remote status is required'),
    location: yup.string().when('remote', {
      is: false,
      then: (schema) =>
        schema
          .required('Location is required when not a remote position')
          .min(1, 'Location is required when not a remote position'),
      otherwise: (schema) => schema.optional(),
    }),
    categoryId: yup
      .string()
      .min(1, 'Please select a category')
      .required('Please select a category'),
    currency: yup
      .string()
      .oneOf(
        ['none', 'usd', 'eur', 'gbp', 'vnd', 'jpy', 'cny'],
        'Invalid currency'
      )
      .required('Currency is required'),
    salaryMin: yup
      .number()
      .typeError('Salary must be a number')
      .nullable()
      .transform((value) =>
        value === null || value === '' ? undefined : value
      )
      .min(0, 'Salary must be non-negative')
      .optional() as yup.Schema<number | undefined>,
    salaryMax: yup
      .number()
      .typeError('Salary must be a number')
      .nullable()
      .transform((value) =>
        value === null || value === '' ? undefined : value
      )
      .min(0, 'Salary must be non-negative')
      .optional() as yup.Schema<number | undefined>,
    skills: yup
      .array(
        yup.object({
          name: yup
            .string()
            .min(1, 'Skill name is required')
            .required('Skill name is required'),
          importance: yup
            .string()
            .oneOf(['REQUIRED', 'PREFERRED', 'OPTIONAL'])
            .required('Importance is required'),
          minYearsExperience: yup
            .number()
            .nullable()
            .transform((value) => (value === null ? undefined : value))
            .min(0, 'Years must be non-negative')
            .optional(),
        })
      )
      .nullable()
      .transform((value) => (value === null ? undefined : value))
      .optional()
      .default([]) as unknown as yup.Schema<
      Array<{
        name: string;
        importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
        minYearsExperience?: number;
      }>
    >,
  })
  .required()
  .test(
    'salary-range-min',
    'Minimum salary must be less than or equal to maximum salary',
    function (values) {
      if (
        values.currency !== 'none' &&
        values.salaryMin != null &&
        values.salaryMax != null
      ) {
        return values.salaryMin <= values.salaryMax;
      }
      return true;
    }
  )
  .test(
    'salary-range-max',
    'Maximum salary must be greater than or equal to minimum salary',
    function (values) {
      if (
        values.currency !== 'none' &&
        values.salaryMin != null &&
        values.salaryMax != null
      ) {
        return values.salaryMin <= values.salaryMax;
      }
      return true;
    }
  );

export type JobPostingFormData = yup.InferType<typeof jobPostingSchema>;
