import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { extractScopesFromToken } from "@/app/lib/auth/scopes";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenData = JSON.parse(token.value);
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

    const response = NextResponse.json(userWithScopes);
    response.cookies.set("discord_user", JSON.stringify(userWithScopes));
    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Logout - clear cookies
    const response = NextResponse.json({ message: "Logged out successfully" });

    response.cookies.delete("discord_user");
    response.cookies.delete("discord_token");

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
