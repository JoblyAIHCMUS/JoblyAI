/**
 * Error handling utilities
 */

export interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Extract error message from various error types
 * @param error - Error object (Error, ErrorResponse, string, or unknown)
 * @param defaultMessage - Fallback message if extraction fails
 * @returns Extracted error message
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle ErrorResponse objects
  if (error && typeof error === 'object') {
    const errorObj = error as ErrorResponse;
    if (errorObj.message) return errorObj.message;
    if (errorObj.error) return errorObj.error;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Format error message for user display
 * @param error - Error object to format
 * @param defaultMessage - Fallback message
 * @returns Formatted user-friendly error message
 */
export function formatErrorForDisplay(
  error: unknown,
  defaultMessage = 'Something went wrong. Please try again.'
): string {
  const message = getErrorMessage(error);

  // Remove technical prefixes for cleaner display
  return (
    message
      .replace(/^Error: /, '')
      .replace(/^(HTTP|API) Error \d+:\s*/, '')
      .charAt(0)
      .toUpperCase() + message.slice(1)
  );
}

/**
 * Check if error is a specific type
 * @param error - Error to check
 * @param statusCode - HTTP status code to match
 * @returns true if error matches the status code
 */
export function isErrorWithStatus(error: unknown, statusCode: number): boolean {
  if (!error || typeof error !== 'object') return false;
  const errorObj = error as ErrorResponse;
  return errorObj.statusCode === statusCode;
}

/**
 * Check if error is a network/connectivity error
 * @param error - Error to check
 * @returns true if error appears to be a network error
 */
export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('fetch') ||
    message.toLowerCase().includes('connection')
  );
}
