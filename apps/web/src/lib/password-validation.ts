/**
 * Password validation rules and utilities
 * Ensures consistent password requirements across the application
 */

// Special characters allowed in passwords
const SPECIAL_CHARACTERS = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';

// Regular expression for password validation
// Requirements:
// - At least 8 characters
// - At least one lowercase letter
// - At least one uppercase letter
// - At least one digit
// - At least one special character
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

/**
 * Validates that a password meets all requirements
 * @param password - The password to validate
 * @returns True if password meets all requirements, false otherwise
 */
export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

/**
 * User-friendly error message for password requirements
 */
export const PASSWORD_REQUIREMENTS_TEXT =
  'Password must be at least 8 characters, include upper, lower, number, special character';

/**
 * Get detailed password requirement information
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requirements: [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'At least one uppercase letter', regex: /[A-Z]/ },
    { label: 'At least one lowercase letter', regex: /[a-z]/ },
    { label: 'At least one digit', regex: /\d/ },
    {
      label: `At least one special character (${SPECIAL_CHARACTERS})`,
      regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    },
  ],
} as const;
