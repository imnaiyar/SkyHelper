import type { IdResolvalble } from "@/types/utils";

export class Utils {
  /**
   * Returns the creation date of the given ID.
   *
   * @param id - The ID to resolve.
   * @returns The creation date of the ID.
   */
  static createdAt<T extends IdResolvalble>(id: T): Date {
    const relovedId = this.resolveId(id);
    return new Date(this.getTimestampFromSnowflake(relovedId));
  }

  /**
   * Returns the creation timestamp of the given ID.
   *
   * @param id - The ID to resolve.
   * @returns The creation timestamp of the ID.
   */
  static createdTimeStamp<T extends IdResolvalble>(id: T): number {
    const relovedId = this.resolveId(id);
    return this.getTimestampFromSnowflake(relovedId);
  }

  /**
   * Resolves the given ID to a string.
   *
   * @param id - The ID to resolve.
   * @returns The resolved ID as a string.
   */
  static resolveId<T extends IdResolvalble>(id: T): string {
    let resolvedId;
    if (typeof id === "string") resolvedId = id;
    else if (typeof id === "object" && "id" in id) resolvedId = id.id;
    else resolvedId = id.user.id;
    return resolvedId;
  }

  /**
   * Extracts the timestamp from a Snowflake ID.
   *
   * @param snowflake - The Snowflake ID.
   * @returns The extracted timestamp.
   */
  static getTimestampFromSnowflake(snowflake: string): number {
    return Number(BigInt(snowflake) >> BigInt(22)) + 1420070400000;
  }
}
