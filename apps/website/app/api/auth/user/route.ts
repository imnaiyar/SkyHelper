import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = JSON.parse(token.value);
    const user = await fetch(`https://discord.com/api/v10/users/@me`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Content-Type": "application/json",
      },
    }).then((u) => u.json());

    const response = NextResponse.json({ ...user, verified: true });
    response.cookies.set("discord_user", JSON.stringify({ ...user, verified: true }));
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
