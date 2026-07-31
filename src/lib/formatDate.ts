const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Formats a plain YYYY-MM-DD without a Date round-trip so the displayed day
// never shifts with the viewer's timezone.
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
