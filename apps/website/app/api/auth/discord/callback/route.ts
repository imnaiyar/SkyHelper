import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (!state) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error="state" not found`);
  }
  // hello
  const pathname = state.split(":")[1];
  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${request.nextUrl.origin}${pathname}?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${request.nextUrl.origin}${pathname}?error=no_code`);
  }
  return NextResponse.redirect(`${request.nextUrl.origin}${pathname}?code=${code}&state=${state}`);
}
