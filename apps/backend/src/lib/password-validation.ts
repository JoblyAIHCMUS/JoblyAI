/**
 * Password validation rules and utilities (Backend)
 * Ensures consistent password requirements across the application
 */

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
