import { NextRequest, NextResponse } from "next/server";
import { extractScopesFromToken } from "@/lib/auth/scopes";
import { COOKIE_NAMES, isTokenExpired, setCookie, clearCookies, getServerCookie } from "@/lib/auth/cookies";

export async function GET(req: NextRequest) {
  try {
    const data = await getServerCookie(req);

    if (!data?.success) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (isTokenExpired(data.data)) {
      const response = NextResponse.json({ error: "Token expired" }, { status: 401 });
      clearCookies(response, [COOKIE_NAMES.TOKEN, COOKIE_NAMES.USER]);
      return response;
    }

    const grantedScopes = extractScopesFromToken(data.data);

    const user = await fetch(`https://discord.com/api/v10/users/@me`, {
      headers: {
        Authorization: `Bearer ${data.data.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!user.ok) {
      return NextResponse.json({ error: user.statusText }, { status: user.status, statusText: user.statusText });
    }

    const userWithScopes = {
      ...(await user.json()),
      verified: true,
      grantedScopes,
    };

    const response = NextResponse.json(userWithScopes);
    // Update user data in cookie
    setCookie(response, COOKIE_NAMES.USER, JSON.stringify(userWithScopes));
    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    clearCookies(response, [COOKIE_NAMES.TOKEN]);

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
