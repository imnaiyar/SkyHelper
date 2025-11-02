import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Merges multiple RequestInit objects into a single RequestInit
 * Later values override earlier ones, with special handling for headers
 */
export function mergeInits(...inits: (RequestInit | undefined)[]): RequestInit {
  const merged: RequestInit = {};

  for (const init of inits) {
    if (!init) continue;

    // Merge headers separately
    if (init.headers) {
      merged.headers = {
        ...(merged.headers instanceof Headers ? Object.fromEntries(merged.headers.entries()) : merged.headers || {}),
        ...(init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : init.headers),
      };
    }

    // Merge other properties (later values override)
    Object.assign(merged, {
      ...init,
      headers: merged.headers,
    });
  }

  return merged;
}
