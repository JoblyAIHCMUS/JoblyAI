import type { EmploymentType } from '@/types/job';

/**
 * Centralized configuration for employment type mapping.
 * Single source of truth for enum values and their display labels.
 */

export const EMPLOYMENT_TYPE_MAP: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  OTHER: 'Other',
};

export const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_MAP).map(
  ([value, label]) => ({
    value: value as EmploymentType,
    label,
  })
);

/**
 * Converts enum value to display label
 * @example
 * formatEmploymentType('FULL_TIME') // => 'Full-time'
 */
export function formatEmploymentType(type: EmploymentType | string): string {
  return EMPLOYMENT_TYPE_MAP[type as EmploymentType] ?? type;
}
