import { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
export interface CookieOptions {
  name: string;
  value: string;
  maxAge?: number; // in seconds
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string;
}

export interface AccessToken extends RESTPostOAuth2AccessTokenResult {
  issued_at: number;
}

const isDevelopment = process.env.NODE_ENV === "development";

const defaultoptions = {
  httpOnly: true,
  secure: !isDevelopment,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export function setCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: Partial<Omit<CookieOptions, "name" | "value">> = {},
): void {
  const cookieOptions = {
    ...defaultoptions,
    ...options,
  };

  response.cookies.set(name, value, cookieOptions);
}

export function setCookies(
  response: NextResponse,
  cookies: Array<{ name: string; value: string; options?: Partial<Omit<CookieOptions, "name" | "value">> }>,
): void {
  cookies.forEach(({ name, value, options }) => setCookie(response, name, value, options));
}

export function clearCookies(response: NextResponse, cookieNames: string[]): void {
  cookieNames.forEach((name) => {
    response.cookies.delete(name);
  });
}

export const COOKIE_NAMES = {
  TOKEN: "auth_token",
  USER: "auth_user",
  STATE: "auth_state",
} as const;

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
  issued_at: z.number(),
});

export function getServerCookie(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAMES.TOKEN);
  return token?.value ? tokenSchema.safeParse(JSON.parse(token.value)) : null;
}

export function isTokenExpired(tokenData: AccessToken): boolean {
  if (!tokenData || !tokenData.issued_at || !tokenData.expires_in) {
    return true;
  }

  const issuedAt = tokenData.issued_at;
  const expiresIn = tokenData.expires_in * 1000; // Convert to milliseconds
  const now = Date.now();

  return now >= issuedAt + expiresIn;
}
