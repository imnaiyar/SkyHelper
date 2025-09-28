import { cookies } from "next/headers";
import { COOKIE_NAMES } from "./auth/cookies";
import { APIApplicationRoleConnection, Routes } from "discord-api-types/v10";

const BASE_API = "https://discord.com/api/v10";

export async function getRoleConnections() {
  const d = await discordRequest<APIApplicationRoleConnection>(
    Routes.userApplicationRoleConnection(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!),
  );

  if (d.success) {
    const roleConnection = d.data!;
    return {
      username: roleConnection.platform_username || undefined,
      metadata: {
        wings: Number(roleConnection.metadata?.wings || 0),
        since: roleConnection.metadata?.since || undefined,
        cr: (roleConnection.metadata?.cr || "0") === "1",
        eden: (roleConnection.metadata?.eden || "0") === "1",
        hangout: (roleConnection.metadata?.hangout || "0") === "1",
      },
    };
  }
}

export async function discordRequest<T>(route: string, init?: RequestInit) {
  const session = (await cookies()).get(COOKIE_NAMES.TOKEN)?.value;
  if (!session) return { success: false, message: "Not authenticated" };
  const req = await fetch(`${BASE_API}${route}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${JSON.parse(session).access_token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!req.ok) {
    /*  if (req.status === 401) {
      // perhaps token expired, 
      // TODO: implement token refresh
    } */
    return { success: false, message: req.statusText };
  }
  return { success: true, data: (await req.json()) as T };
}
