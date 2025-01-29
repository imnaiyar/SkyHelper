/**
 * Formats a Date object into "DD-MM-YYYY" string representation
 * @param date The date object to format
 */
export function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Parse a date in the format "DD-MM-YYYY" to Date object
 * @param dateString Date in "DD-MM-YYYY" format
 */
export function parseDate(dateString: string) {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}
