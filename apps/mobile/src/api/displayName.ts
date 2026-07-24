/**
 * Compute the display name for a candidate/employer from the available
 * name fields. Prefers firstName + lastName when both are set; falls
 * back to the legacy `name` field for OAuth users (whose firstName
 * and lastName are always null). Returns empty string if all are blank;
 * callers should chain `|| email || 'Unknown Candidate'` as a last resort.
 */
export function computeDisplayName(p: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
}): string {
  return (
    [p.firstName, p.lastName].filter(Boolean).join(' ').trim() ||
    p.name?.trim() ||
    ''
  );
}
