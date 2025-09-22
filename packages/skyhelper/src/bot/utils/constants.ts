export const CLIENT_ID = process.env.CLIENT_ID;

export const isProd = process.env.NODE_ENV === "production";

export const CalendarMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
