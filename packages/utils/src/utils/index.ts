import { emojis } from "@skyhelperbot/constants";

export * from "./postToBin.js";
export * from "./parsePerms.js";
export * from "./recursiveReadDir.js";
export * from "./parseDateFormat.js";
export * from "./resolveColors.js";
export * from "./v2-builders.js";
export * from "./PermissionUtils.js";

/**
 * Creates a progress bar using emoji segments (start, middle, end)
 * @param percentage - Progress percentage (0-100)
 * @param totalSegments Total emoji segments to use for the progress bar (`default: 8`)
 * @returns Formatted progress bar string
 */
export function createEmojiProgressBar(percentage: number, totalSegments = 8): string {
  const filledSegments = Math.round((percentage / 100) * totalSegments);

  let progressBar = "";

  for (let i = 0; i < totalSegments; i++) {
    const isFilled = i < filledSegments;

    if (i === 0) {
      // Start segment
      progressBar += isFilled ? `<:_:${emojis.progress_filled_start}>` : `<:_:${emojis.progress_empty_start}>`;
    } else if (i === totalSegments - 1) {
      // End segment
      progressBar += isFilled ? `<:_:${emojis.progress_filled_end}>` : `<:_:${emojis.progress_empty_end}>`;
    } else {
      // Middle segments
      progressBar += isFilled ? `<:_:${emojis.progress_filled_middle}>` : `<:_:${emojis.progress_empty_middle}>`;
    }
  }

  return `${progressBar} ${percentage}%`;
}
