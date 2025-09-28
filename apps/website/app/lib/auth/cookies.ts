import { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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

export function serializeTokenData(tokenData: RESTPostOAuth2AccessTokenResult): string {
  return JSON.stringify({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    scope: tokenData.scope,
    token_type: tokenData.token_type,
    issued_at: Date.now(),
  });
}

export function deserializeTokenData(tokenString: string): AccessToken | null {
  try {
    return JSON.parse(tokenString);
  } catch {
    return null;
  }
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
