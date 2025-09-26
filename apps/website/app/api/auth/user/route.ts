import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { extractScopesFromToken } from "@/app/lib/auth/scopes";
import { COOKIE_NAMES, deserializeTokenData, isTokenExpired, setCookie, clearCookies } from "@/app/lib/auth/cookies";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.TOKEN);

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenData = deserializeTokenData(token.value);
    if (!tokenData || isTokenExpired(tokenData)) {
      // Token is invalid or expired
      const response = NextResponse.json({ error: "Token expired" }, { status: 401 });
      clearCookies(response, [COOKIE_NAMES.TOKEN, COOKIE_NAMES.USER]);
      return response;
    }

    const grantedScopes = extractScopesFromToken(tokenData);

    const user = await fetch(`https://discord.com/api/v10/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
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
    // Logout - clear secure cookies
    const response = NextResponse.json({ message: "Logged out successfully" });

    clearCookies(response, [COOKIE_NAMES.TOKEN]);

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
