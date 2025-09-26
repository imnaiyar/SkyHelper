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

/**
 * Default secure cookie options
 */
const defaultSecureOptions = {
  httpOnly: true,
  secure: !isDevelopment, // Use secure cookies in production only
  sameSite: "lax" as const,
  path: "/",
  // 7 days expiration for auth tokens
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * Set a secure cookie on the response
 */
export function setCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: Partial<Omit<CookieOptions, "name" | "value">> = {},
): void {
  const cookieOptions = {
    ...defaultSecureOptions,
    ...options,
  };

  response.cookies.set(name, value, cookieOptions);
}

/**
 * Set multiple secure cookies on the response
 */
export function setCookies(
  response: NextResponse,
  cookies: Array<{ name: string; value: string; options?: Partial<Omit<CookieOptions, "name" | "value">> }>,
): void {
  cookies.forEach(({ name, value, options }) => setCookie(response, name, value, options));
}

/**
 * Clear cookies by setting them to expire in the past
 */
export function clearCookies(response: NextResponse, cookieNames: string[]): void {
  cookieNames.forEach((name) => {
    response.cookies.delete(name);
  });
}

/**
 * Cookie names used by the authentication system
 */
export const COOKIE_NAMES = {
  TOKEN: "auth_token",
  USER: "auth_user",
  STATE: "auth_state",
} as const;

/**
 * Serialize token data for storage in cookies
 */
export function serializeTokenData(tokenData: RESTPostOAuth2AccessTokenResult): string {
  return JSON.stringify({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    scope: tokenData.scope,
    token_type: tokenData.token_type,
    // Add timestamp for expiration tracking
    issued_at: Date.now(),
  });
}

/**
 * Deserialize token data from cookie
 */
export function deserializeTokenData(tokenString: string): AccessToken | null {
  try {
    return JSON.parse(tokenString);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(tokenData: AccessToken): boolean {
  if (!tokenData || !tokenData.issued_at || !tokenData.expires_in) {
    return true;
  }

  const issuedAt = tokenData.issued_at;
  const expiresIn = tokenData.expires_in * 1000; // Convert to milliseconds
  const now = Date.now();

  return now >= issuedAt + expiresIn;
}
