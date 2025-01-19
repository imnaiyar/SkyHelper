import type { SkyHelper } from "#bot/structures/Client";
import { PermissionFlagsBits, type APIGuildMember, type APIRole, type APITextChannel } from "@discordjs/core";
type PermissionFlags = keyof typeof PermissionFlagsBits;
type StringPermissions = `${number}`;
export type PermissionsResolvable =
  | bigint
  | PermissionFlags
  | StringPermissions
  | StringPermissions[]
  | bigint[]
  | PermissionFlags[];

export class PermissionsUtil {
  /**
   * Bitfield of the permissions
   */
  bitfield: bigint;

  /**
   * Flags of the permissions
   */
  flags: (keyof typeof PermissionFlagsBits)[];

  /**
   *
   * @param perms Permissions to resolve
   */
  constructor(readonly perms: PermissionsResolvable = 0n) {
    this.bitfield = this.resolveBitFields(perms);
    this.flags = this.resolveBitFlags(this.bitfield);
  }

  /**
   * {@link PermissionsUtil.resolveBits} but as an instance method.
   * This is me just being lazy really
   */
  resolveBitFields = PermissionsUtil.resolveBits;

  /**
   * {@link PermissionsUtil.resolveFlags} but as an instance method.
   */
  resolveBitFlags = PermissionsUtil.resolveFlags;

  /**
   * Resolves given permission resolvable to bitfield
   *
   * @returns Returns the resolved bitfield
   */
  static resolveBits(perms: PermissionsResolvable): bigint {
    if (typeof perms === "bigint" && perms > 0n) return perms;
    if (Array.isArray(perms)) {
      return perms.map(this.resolveBits).reduce((acc, bit) => acc | bit, 0n);
    }
    if (typeof perms === "string") {
      if (!Number.isNaN(perms)) return BigInt(perms);
      if (PermissionFlagsBits[perms as PermissionFlags] !== undefined) {
        return PermissionFlagsBits[perms as PermissionFlags];
      }
    }
    throw new Error("Recieved Unknown Permissions");
  }

  /**
   *
   * @returns Returns string representation of the permissions
   */
  static resolveFlags(bits: bigint): PermissionFlags[] {
    const flags: PermissionFlags[] = [];
    for (const [key, value] of Object.entries(PermissionFlagsBits)) {
      if (bits & value) flags.push(key as PermissionFlags);
    }
    return flags;
  }

  /**
   * Check if it contains the given permissions
   *
   */
  has(perms: PermissionsResolvable) {
    const bits = this.resolveBitFields(perms);
    return (this.bitfield & bits) === bits;
  }

  /**
   * Remove the permissions bits
   */
  remove(perms: PermissionsResolvable) {
    const bits = this.resolveBitFields(perms);
    this.bitfield &= ~bits;
    this.flags = this.resolveBitFlags(this.bitfield);
    return this;
  }

  /**
   * Add the permissions bits
   */
  add(perms: PermissionsResolvable) {
    const bits = this.resolveBitFields(perms);
    this.bitfield |= bits;
    this.flags = this.resolveBitFlags(this.bitfield);
    return this;
  }

  static overwriteFor(userOrRole: APIRole | APIGuildMember, channel: APITextChannel, client: SkyHelper): PermissionsUtil {
    const isRole = "permissions" in userOrRole;
    const everyonOverwrites = channel.permission_overwrites!.find((p) => p.id === channel.guild_id);
    const guild = client.guilds.get(channel.guild_id!);
    if (isRole) {
      const perms = new PermissionsUtil(userOrRole.permissions as `${number}`);
      const roleOverwrites = channel.permission_overwrites!.find((p) => p.id === userOrRole.id);
      if (everyonOverwrites) {
        perms.remove(everyonOverwrites.deny as `${number}`).add(everyonOverwrites.allow as `${number}`);
      }
      if (roleOverwrites) {
        perms.remove(roleOverwrites.deny as `${number}`).add(roleOverwrites.allow as `${number}`);
      }
      return perms;
    }
    const perms = new PermissionsUtil(
      userOrRole.roles.map((r) => {
        const role = guild?.roles.find((ro) => ro.id === r);
        if (!role) throw new Error("Role not found");
        return role.permissions as `${number}`;
      }),
    );
    const roleOverwrites = channel
      .permission_overwrites!.map((p) => p.type === 0 && userOrRole.roles.includes(p.id) && p)
      .filter((p) => p !== false);
    if (everyonOverwrites) {
      perms.remove(everyonOverwrites.deny as `${number}`).add(everyonOverwrites.allow as `${number}`);
    }
    if (roleOverwrites.length) {
      perms.remove(this.resolveBits(roleOverwrites.map((p) => p!.deny as `${number}`)));
      perms.add(this.resolveBits(roleOverwrites.map((p) => p!.allow as `${number}`)));
    }
    return perms;
  }
  /**
   * Returns permissions flags of this bitfield
   */
  toArray() {
    return this.flags;
  }
}
