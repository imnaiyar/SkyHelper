export const REMINDERS_KEY = ["eden", "ts", "dailies", "aurora", "geyser", "grandma", "reset", "turtle"] as const;

export const CLIENT_ID = process.env.CLIENT_ID!;

export const emojis = {
  tree_top: "<:tree_top:1340954527762743392>",
  tree_middle: "<:tree_middle:1339963268969791550> ",
  tree_end: "<:tree_end:1339963241991901224>",
};
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
