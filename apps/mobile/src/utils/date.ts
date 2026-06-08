export function formatDate(date: string | null | undefined): string {
  if (!date) return 'Unknown';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  const day = parsed.getDate();
  const month = parsed.toLocaleString('en-US', { month: 'long' });
  const year = parsed.getFullYear();

  return `${day} ${month}, ${year}`;
}
