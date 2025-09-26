import { cookies } from "next/headers";
import { AuthUser } from "./auth/types";
import { extractScopesFromToken } from "./auth/scopes";
import { COOKIE_NAMES, deserializeTokenData, isTokenExpired } from "./auth/cookies";
import { APIApplicationRoleConnection, Routes } from "discord-api-types/v10";

const BASE_API = "https://discord.com/api/v10";

export async function getUser(): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.TOKEN);

    if (!token) {
      return { user: null };
    }

    const tokenData = deserializeTokenData(token.value);
    if (!tokenData || isTokenExpired(tokenData)) {
      return { user: null, error: "Token expired" };
    }

    // Check if we have cached user data
    const userCookie = cookieStore.get(COOKIE_NAMES.USER);
    if (userCookie) {
      try {
        const cachedUser = JSON.parse(userCookie.value) as AuthUser;
        return { user: cachedUser };
      } catch {
        // If parsing fails, fall back to fetching fresh data
      }
    }

    const grantedScopes = extractScopesFromToken(tokenData);

    const response = await fetch(`${BASE_API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { user: null, error: `Discord API error: ${response.statusText}` };
    }

    const discordUser = await response.json();
    const user: AuthUser = {
      ...discordUser,
      verified: true,
      grantedScopes,
    };

    return { user };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { user: null, error: "Internal server error" };
  }
}

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
