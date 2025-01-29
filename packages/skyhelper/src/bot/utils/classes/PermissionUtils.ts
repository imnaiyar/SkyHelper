import type { SkyHelper } from "@/structures/Client";
import { PermissionFlagsBits, type APIGuild, type APIGuildMember, type APIRole, type APITextChannel } from "@discordjs/core";
type PermissionFlags = keyof typeof PermissionFlagsBits;
import logger from "@/handlers/logger";
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
  get flags() {
    return this.resolveBitFlags(this.bitfield);
  }

  /**
   *
   * @param perms Permissions to resolve
   */
  constructor(readonly perms: PermissionsResolvable = 0n) {
    this.bitfield = this.resolveBitFields(perms);
  }

  /**
   * {@link PermissionsUtil.resolveBits} but as an instance method.
   * This is me just being lazy really
   */
  resolveBitFields = PermissionsUtil.resolveBits.bind(PermissionsUtil);

  /**
   * {@link PermissionsUtil.resolveFlags} but as an instance method.
   */
  resolveBitFlags = PermissionsUtil.resolveFlags.bind(PermissionsUtil);

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
      if (!Number.isNaN(parseInt(perms))) return BigInt(perms);
      if (PermissionFlagsBits[perms as PermissionFlags] !== undefined) {
        return PermissionFlagsBits[perms as PermissionFlags];
      }
    }
    logger.warn(`Recieved Unknown Permissions: ${perms}`); // just warn, there maybe new permissions that maybe not handled by discord.js yet

    return 0n; // return this, if any of the above case doesn't match. Ideally this should happen very rarely
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
    return this;
  }

  /**
   * Add the permissions bits
   */
  add(perms: PermissionsResolvable) {
    const bits = this.resolveBitFields(perms);
    this.bitfield |= bits;
    return this;
  }

  /**
   * Permissions that are missing from the passed permission resolvable
   * @param perms
   * @returns The missing permissions
   */
  missing(perms: PermissionsResolvable) {
    const bits = this.resolveBitFields(perms);
    const missingBits = bits & ~this.bitfield;
    return this.resolveBitFlags(missingBits);
  }

  /**
   * Get opermissions overwrites for a user or role in a channel including guild level and channel overrides
   * @param userOrRole
   * @param channel
   * @param client
   * @returns
   */
  static overwriteFor(userOrRole: APIRole | APIGuildMember, channel: APITextChannel, client: SkyHelper): PermissionsUtil {
    const isRole = "permissions" in userOrRole;
    const guild = client.guilds.get(channel.guild_id!);
    const perms = this.permissionsFor(userOrRole, guild!);
    if (perms.has("Administrator")) return this.all();
    const everyoneOverwrites = channel.permission_overwrites!.find((p) => p.id === channel.guild_id);
    if (isRole) {
      const _perms = new PermissionsUtil(userOrRole.permissions as `${number}`);
      const roleOverwrites = channel.permission_overwrites!.find((p) => p.id === userOrRole.id);
      if (everyoneOverwrites) {
        _perms.remove(everyoneOverwrites.deny as `${number}`).add(everyoneOverwrites.allow as `${number}`);
      }
      if (roleOverwrites) {
        _perms.remove(roleOverwrites.deny as `${number}`).add(roleOverwrites.allow as `${number}`);
      }
      return _perms;
    }
    const roleOverwrites = channel
      .permission_overwrites!.map((p) => p.type === 0 && userOrRole.roles.includes(p.id) && p)
      .filter((p) => p !== false);
    const memberOverwrites = channel.permission_overwrites!.find((p) => p.id === userOrRole.user.id);
    if (everyoneOverwrites) {
      perms.remove(everyoneOverwrites.deny as `${number}`).add(everyoneOverwrites.allow as `${number}`);
    }
    if (roleOverwrites.length) {
      perms.remove(this.resolveBits(roleOverwrites.map((p) => p!.deny as `${number}`)));
      perms.add(this.resolveBits(roleOverwrites.map((p) => p!.allow as `${number}`)));
    }
    if (memberOverwrites) {
      perms.remove(memberOverwrites.deny as `${number}`).add(memberOverwrites.allow as `${number}`);
    }
    return perms;
  }

  /**
   * Get permissions for a guild member based on their roles
   * @param member
   * @param client
   * @param guild
   */
  static permissionsFor(memberOrRole: APIGuildMember | Omit<APIGuildMember, "user"> | APIRole, guild: APIGuild): PermissionsUtil {
    const isRole = "position" in memberOrRole;
    const perms = new PermissionsUtil(
      isRole
        ? (memberOrRole.permissions as `${number}`)
        : memberOrRole.roles.map((r) => {
            const role = guild.roles.find((ro) => ro.id === r);
            if (!role) throw new Error("Role not found");
            const everyoneRole = guild.roles.find((ro) => ro.id === guild.id);

            return BigInt(role.permissions) | BigInt(everyoneRole!.permissions);
          }),
    );
    return perms.has("Administrator") ? this.all() : perms;
  }
  /**
   * Returns util instance having all permissions
   */
  static all(): PermissionsUtil {
    const bitfield = Object.values(PermissionFlagsBits).reduce((acc, bit) => acc | bit, 0n);
    return new PermissionsUtil(bitfield);
  }

  /**
   * Returns permissions flags of this bitfield
   */
  toArray() {
    return this.flags;
  }
}
