import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenData = JSON.parse(token.value);

    // Check if user has the required scope
    const scopes = tokenData.scope ? tokenData.scope.split(" ") : [];
    if (!scopes.includes("role_connections.write")) {
      return NextResponse.json(
        {
          error: "Insufficient permissions. role_connections.write scope required.",
        },
        { status: 403 },
      );
    }

    // Fetch role connection metadata from Discord API
    const response = await fetch(
      `https://discord.com/api/v10/users/@me/applications/${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}/role-connection`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 404) {
      // No role connection exists yet, return default values
      return NextResponse.json({
        username: undefined,
        metadata: {
          wings: 0,
          since: undefined,
          cr: false,
          eden: false,
          hangout: false,
        },
      });
    }

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    const roleConnection = await response.json();

    return NextResponse.json({
      username: roleConnection.platform_username || undefined,
      metadata: {
        wings: Number(roleConnection.metadata?.wings || 0),
        since: roleConnection.metadata?.since || undefined,
        cr: (roleConnection.metadata?.cr || "0") === "1",
        eden: (roleConnection.metadata?.eden || "0") === "1",
        hangout: (roleConnection.metadata?.hangout || "0") === "1",
      },
    });
  } catch (error) {
    console.error("Error fetching role metadata:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenData = JSON.parse(token.value);

    // Check if user has the required scope
    const scopes = tokenData.scope ? tokenData.scope.split(" ") : [];
    if (!scopes.includes("role_connections.write")) {
      return NextResponse.json(
        {
          error: "Insufficient permissions. role_connections.write scope required.",
        },
        { status: 403 },
      );
    }

    const updates = await request.json();

    // Get current metadata first
    const currentResponse = await fetch(
      `https://discord.com/api/v10/users/@me/applications/${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}/role-connection`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    let currentMetadata = {};
    if (currentResponse.ok) {
      const current = await currentResponse.json();
      currentMetadata = current.metadata || {};
    }

    // Merge with updates
    const newMetadata = {
      ...currentMetadata,
      ...Object.fromEntries(
        Object.entries(updates).map(([key, value]) => {
          // Convert boolean values to strings for Discord API
          if (typeof value === "boolean") {
            return [key, value ? "1" : "0"];
          }
          return [key, value];
        }),
      ),
    };

    // Update role connection
    const updateResponse = await fetch(
      `https://discord.com/api/v10/users/@me/applications/${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}/role-connection`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform_name: "SkyHelper",
          platform_username: `Sky Player ${Date.now()}`, // You might want to get actual Sky username here
          metadata: newMetadata,
        }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error(`Discord API error: ${updateResponse.statusText}`);
    }

    const updatedRoleConnection = await updateResponse.json();

    return NextResponse.json({
      username: updatedRoleConnection.platform_username || undefined,
      metadata: {
        wings: Number(updatedRoleConnection.metadata?.wings || 0),
        since: updatedRoleConnection.metadata?.since || undefined,
        cr: (updatedRoleConnection.metadata?.cr || "0") === "1",
        eden: (updatedRoleConnection.metadata?.eden || "0") === "1",
        hangout: (updatedRoleConnection.metadata?.hangout || "0") === "1",
      },
    });
  } catch (error) {
    console.error("Error updating role metadata:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
