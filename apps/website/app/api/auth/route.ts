import { getServerCookie } from "@/app/lib/auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = getServerCookie(req);
  if (data?.data) {
    return NextResponse.json(data.data);
  } else return NextResponse.json({ error: "Not Authenticated " }, { status: 401 });
}
