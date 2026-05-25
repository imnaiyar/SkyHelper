export const OWNER_IDS = (process.env.NEXT_PUBLIC_OWNER_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export const isOwner = (userId?: string | null) => (userId ? OWNER_IDS.includes(userId) : false);
