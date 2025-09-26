import { NextRequest, NextResponse } from "next/server";
import { extractScopesFromToken } from "@/app/lib/auth/scopes";
import { setCookie, serializeTokenData, COOKIE_NAMES } from "@/app/lib/auth/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = `${BASE_URL}/api/auth/discord/callback`;

export async function POST(request: NextRequest) {
  const { code, redirectUri } = await request.json();

  if (!code) {
    return NextResponse.redirect(`${redirectUri}?error=no_code`);
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.log(tokenResponse.statusText);
      throw new Error("Failed to exchange code for token:" + tokenResponse.statusText);
    }

    const tokenData = await tokenResponse.json();
    const grantedScopes = extractScopesFromToken(tokenData);

    const user = await fetch(`https://discord.com/api/v10/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    }).then((u) => u.json());

    const userWithScopes = {
      ...user,
      verified: true,
      grantedScopes,
    };

    // Set secure cookies instead of returning sensitive data
    const response = NextResponse.json({
      ...userWithScopes,
      // Don't include sensitive token data in response
    });

    // Store token and user data in secure, httpOnly cookies
    setCookie(response, COOKIE_NAMES.TOKEN, serializeTokenData(tokenData));

    return response;
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=oauth_failed`);
  }
}
