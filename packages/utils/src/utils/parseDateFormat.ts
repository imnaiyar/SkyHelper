/**
 * Parse a given date to it's format
 * @param dateString The date to parse
 * @example
 * console.log(parseDateFormat("04/10/2024")) // Logs: DD/MM/YYYY
 *
 * @returns The format, or null if format can't be determined
 */
export const parseDateFormat = (dateString: string): string | null => {
  const formats = [
    { regex: /^\d{2}-\d{2}-\d{4}$/, format: "DD-MM-YYYY" },
    { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: "DD/MM/YYYY" },
    { regex: /^\d{4}-\d{2}-\d{2}$/, format: "YYYY-MM-DD" },
    { regex: /^\d{4}\/\d{2}\/\d{2}$/, format: "YYYY/MM/DD" },
    { regex: /^\d{1,2}-\d{1,2}-\d{4}$/, format: "D-M-YYYY" },
    { regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: "D/M/YYYY" },
    { regex: /^[A-Za-z]+\s\d{1,2},\s\d{4}$/, format: "Month DD, YYYY" },
  ];

  for (const { regex, format } of formats) {
    if (regex.test(dateString)) {
      return format;
    }
  }

  return null; // If no format matches
};
