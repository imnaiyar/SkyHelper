/**
 * Represents a class for handling flags in a content string.
 */
export class MessageFlags {
  /**
   * The content string.
   */
  private content: string;

  /** Regex to match flags */
  private flagRegex = /--([^\s]+(?:=[^\s]+)?)/g;

  /** Array of flags */
  public flags: string[];

  /**
   * Creates an instance of Flags.
   * @param content - The content string.
   */
  constructor(content: string) {
    this.content = content;
    this.flags = this.getFlags();
  }

  /**
   * Retrieves all the flags from the content string.
   * @returns An array of flags.
   */
  public getFlags(): string[] {
    const matches = this.content.match(this.flagRegex);
    if (matches) {
      return matches.map((match) => match.slice(2));
    }
    return [];
  }

  /**
   * Retrieves the value of a specific flag from the content string.
   * @param flag - The flag to retrieve.
   * @returns The value of the flag if found, otherwise null.
   */
  public getFlag(flag: string): string | null {
    return this.flags.find((f) => f.startsWith(flag)) ?? null;
  }

  /**
   * Checks if the content string has one or more flags.
   * @param flags - The flag(s) to check.
   * @returns True if the content string has the flag(s), otherwise false.
   */
  public has(flags: string | string[]): boolean {
    if (Array.isArray(flags)) {
      for (const f of flags) {
        return this.flags.find((flag) => flag.startsWith(f)) !== undefined;
      }
      return false;
    } else {
      return this.flags.find((flag) => flag.startsWith(flags)) !== undefined;
    }
  }

  /**
   * Checks if the content string has any of the flags in the supplied array.
   * @param flags - The flags to check.
   * @returns True if the content string has any of the flags, otherwise false.
   */
  public hasAny(flags: string[]): boolean {
    for (const f of flags) {
      if (this.flags.find((flag) => flag.startsWith(f))) return true;
    }
    return false;
  }

  /**
   * Returns all the invalid flags in the content string.
   * @param flags Array of flags to check against
   * @returns Array of invalid flags or null
   */
  public invalidFlags(flags: string[]): string[] | null {
    const invalidFlags = flags.filter((flag) => !this.flags.find((fl) => fl.startsWith(flag)));
    return invalidFlags.length ? invalidFlags : null;
  }

  /** Returns the message content without flags */
  public removeFlags(): string {
    return this.content.replace(this.flagRegex, "").trim();
  }
}
