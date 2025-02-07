import type { APIUser } from "@discordjs/core";
import { HttpException, HttpStatus } from "@nestjs/common";

export type UserSession = {
  access_token: string;
  token_type: "Bearer";
};

export async function getUser(accessToken: string) {
  const res = await fetch(`https://discord.com/api/v10/users/@me`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  if (!res.ok) throw new HttpException("Failed to get user data", HttpStatus.INTERNAL_SERVER_ERROR);

  const user = (await res.json()) as APIUser;
  return user;
}
