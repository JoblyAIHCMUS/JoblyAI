/**
 * Format the location label shown on a job card.
 *
 * Rules:
 *   - location set + remote = false → return the location
 *   - location set + remote = true  → return `${location} • Remote`
 *   - location null + remote = true → return "Remote"
 *   - location null + remote = false → return "" (caller decides to omit)
 */
export function formatJobLocation(
  location: string | null,
  remote: boolean
): string {
  if (location && remote) return `${location} • Remote`;
  if (location) return location;
  if (remote) return 'Remote';
  return '';
}
