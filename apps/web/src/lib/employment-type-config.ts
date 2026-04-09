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
};

export const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_MAP).map(
  ([value, label]) => ({
    value: value as EmploymentType,
    label,
  })
);

/**
 * Safely converts a string to a valid EmploymentType or undefined
 * @returns EmploymentType if valid, undefined otherwise
 */
export function parseEmploymentType(
  value: string | undefined | null
): EmploymentType | undefined {
  if (!value) return undefined;
  if (value in EMPLOYMENT_TYPE_MAP) {
    return value as EmploymentType;
  }
  return undefined;
}

/**
 * Converts enum value to display label
 * @example
 * formatEmploymentType('FULL_TIME') // => 'Full-time'
 */
export function formatEmploymentType(type: EmploymentType | string): string {
  return EMPLOYMENT_TYPE_MAP[type as EmploymentType] ?? type;
}

/**
 * Gets a list of valid employment type values
 */
export function getEmploymentTypeValues(): EmploymentType[] {
  return Object.keys(EMPLOYMENT_TYPE_MAP) as EmploymentType[];
}
