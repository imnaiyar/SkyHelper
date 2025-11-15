import { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import {
  DiscordScope,
  BASE_SCOPES,
  ROUTE_SCOPE_REQUIREMENTS,
  ScopeValidationResult,
  AuthUser,
  RouteConfig,
  DISCORD_SCOPES,
} from "./types";

export function getRequiredScopesForRoute(routePath: string): DiscordScope[] {
  const additionalScopes = ROUTE_SCOPE_REQUIREMENTS[routePath] || [];
  return [...BASE_SCOPES, ...additionalScopes];
}

export function getRouteConfig(routePath: string): RouteConfig {
  const additionalScopes = ROUTE_SCOPE_REQUIREMENTS[routePath] || [];
  const allRequiredScopes = [...BASE_SCOPES, ...additionalScopes];

  return {
    path: routePath,
    requiredScopes: additionalScopes,
    allRequiredScopes,
  };
}

export function validateUserScopes(user: AuthUser | null, requiredScopes: DiscordScope[]): ScopeValidationResult {
  const grantedScopes = user?.grantedScopes || [];
  const missingScopes = requiredScopes.filter((scope) => !grantedScopes.includes(scope));

  return {
    isValid: missingScopes.length === 0,
    missingScopes,
    requiredScopes,
    grantedScopes,
  };
}

export function validateUserScopesForRoute(user: AuthUser | null, routePath: string): ScopeValidationResult {
  const requiredScopes = getRequiredScopesForRoute(routePath);
  return validateUserScopes(user, requiredScopes);
}

export function needsReauth(user: AuthUser | null, requiredScopes: DiscordScope[]): boolean {
  if (!user) return true;
  const validation = validateUserScopes(user, requiredScopes);
  return !validation.isValid;
}

export function generateOAuthUrl(requiredScopes: DiscordScope[], redirectPath?: string): string {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;

  if (!clientId) {
    throw new Error("Discord client ID not configured");
  }

  // Generate state with redirect path
  const state = btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  const stateWithPath = redirectPath ? `${state}:${redirectPath}` : state;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: requiredScopes.join(" "),
    state: stateWithPath,
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function extractScopesFromToken(tokenData: RESTPostOAuth2AccessTokenResult): DiscordScope[] {
  if (!tokenData?.scope) return [];

  const scopes = tokenData.scope.split(" ");

  return scopes.filter((scope: string): scope is DiscordScope => {
    const allKnownScopes = [
      ...BASE_SCOPES,
      ...Object.values(ROUTE_SCOPE_REQUIREMENTS).flat(),
      "email",
      "guilds.join",
      "connections",
      "role_connections.write",
      "bot",
      "guilds.members.read",
      "applications.commands",
    ];
    return allKnownScopes.includes(scope as DiscordScope);
  });
}

export function getScopeDescription(scope: DiscordScope): string {
  return DISCORD_SCOPES[scope] || scope;
}

export function checkScopesOrGetReauth(
  user: AuthUser | null,
  requiredScopes: DiscordScope[],
  currentPath?: string,
): { isValid: true } | { isValid: false; reauthUrl: string; missingScopes: DiscordScope[] } {
  const validation = validateUserScopes(user, requiredScopes);

  if (validation.isValid) {
    return { isValid: true };
  }

  return {
    isValid: false,
    reauthUrl: generateOAuthUrl(requiredScopes, currentPath),
    missingScopes: validation.missingScopes,
  };
}
