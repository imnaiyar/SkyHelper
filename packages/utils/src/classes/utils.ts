import { CDNRoutes, type APIUser, type UserAvatarFormat, type DefaultUserAvatarAssets } from "discord-api-types/v10";

export const colors = {
  blue: "#7289DA",
  white: "#FFFFFF",
  lightgrey: "#99AAB5",
  grey: "#2C2F33",
  darkgrey: "#23272A",
  black: "#000000",
  online: "#2db85b",
  offline: "#666",
  dnd: "#cc3737",
  idle: "#dab026",
};

export function fancyCount(n: number): string {
  if (n > 1000000) return Math.floor(n / 1000000) + "M";

  if (n > 1000) {
    if (n < 10000) return (n / 1000).toFixed(1) + "k";
    return Math.floor(n / 1000) + "k";
  }

  return Math.floor(n) + "";
}

export function getUserAvatar(user: APIUser): string {
  return user.avatar
    ? CDNRoutes.userAvatar(user.id, user.avatar, "png" as UserAvatarFormat)
    : CDNRoutes.defaultUserAvatar(Number((BigInt(user.id) >> 22n) % 5n) as DefaultUserAvatarAssets);
}
