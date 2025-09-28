import { APIUser } from "discord-api-types/v10";

export const DISCORD_SCOPES = {
  // Base scopes - always required
  identify: "Access to your Discord username, avatar, and ID",
  guilds: "View Discord servers you're in",

  // Additional scopes for specific features
  email: "Access to your email address",
  "guilds.join": "Join Discord servers on your behalf",
  connections: "View connected accounts (Spotify, Steam, etc.)",
  "role_connections.write": "Update your connected account info for roles (require for /linked-roles)",
  bot: "Add bots to servers",
  "guilds.members.read": "Read server member info",
  "applications.commands": "Use application commands",
} as const;

export type DiscordScope = keyof typeof DISCORD_SCOPES;

export const BASE_SCOPES: DiscordScope[] = ["identify", "guilds"];

export const ROUTE_SCOPE_REQUIREMENTS: Record<string, DiscordScope[]> = {
  "/dashboard/linked-role": ["role_connections.write"],
} as const;

export interface RouteConfig {
  path: string;
  requiredScopes: DiscordScope[];
  allRequiredScopes: DiscordScope[];
}

export interface AuthUser extends APIUser {
  grantedScopes?: DiscordScope[];
}

export interface ScopeValidationResult {
  isValid: boolean;
  missingScopes: DiscordScope[];
  requiredScopes: DiscordScope[];
  grantedScopes: DiscordScope[];
}

export interface ScopeAwareProps {
  requiredScopes?: DiscordScope[];
  fallback?: React.ReactNode;
  onScopesMissing?: (missingScopes: DiscordScope[]) => void;
}
