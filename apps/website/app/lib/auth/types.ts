import { APIUser } from "discord-api-types/v10";

/**
 * Discord OAuth2 scopes and their descriptions
 */
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

/**
 * Base scopes required for all authenticated routes
 */
export const BASE_SCOPES: DiscordScope[] = ["identify", "guilds"];

/**
 * Route-specific scope requirements
 * Key: route path, Value: additional scopes required beyond base scopes
 */
export const ROUTE_SCOPE_REQUIREMENTS: Record<string, DiscordScope[]> = {
  "/dashboard/linked-role": ["role_connections.write"],
} as const;

/**
 * Configuration for a route's scope requirements
 */
export interface RouteConfig {
  /** The route path */
  path: string;
  /** Additional scopes required beyond base scopes */
  requiredScopes: DiscordScope[];
  /** All scopes needed (base + additional) */
  allRequiredScopes: DiscordScope[];
}

/**
 * User's authentication information including scopes
 */
export interface AuthUser extends APIUser {
  /** Scopes that were granted during OAuth */
  grantedScopes?: DiscordScope[];
}

/**
 * Result of scope validation
 */
export interface ScopeValidationResult {
  /** Whether user has all required scopes */
  isValid: boolean;
  /** Scopes that are missing */
  missingScopes: DiscordScope[];
  /** All scopes that are required for this route */
  requiredScopes: DiscordScope[];
  /** Scopes that the user currently has */
  grantedScopes: DiscordScope[];
}

/**
 * Props for components that need scope validation
 */
export interface ScopeAwareProps {
  /** Required scopes for the component/route */
  requiredScopes?: DiscordScope[];
  /** What to render when scopes are missing */
  fallback?: React.ReactNode;
  /** Callback when scopes are missing */
  onScopesMissing?: (missingScopes: DiscordScope[]) => void;
}
