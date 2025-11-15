import { NextResponse } from "next/server";
import { clearCookies, COOKIE_NAMES } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    clearCookies(response, [COOKIE_NAMES.TOKEN]);

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
