"use client";

import { useState, useEffect, useRef } from "react";
import { LogIn, ExternalLink, Shield, Bot, CheckCircle, AlertCircle, LogOut, ChevronDown, User } from "lucide-react";
import Loading from "../ui/Loading";
import { useDiscordAuth } from "./DiscordAuthContext";

interface DiscordLoginProps {
  redirectUri?: string;
  scopes?: string[];
  variant?: "button" | "card";
  size?: "sm" | "md" | "lg";
  showPermissions?: boolean;
  onLoginComplete?: (user: DiscordUser) => void;
  onLoginError?: (error: string) => void;
  className?: string;
  btnTitle?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
}

const DEFAULT_SCOPES = ["identify", "guilds"];
const DISCORD_CDN_URL = "https://cdn.discordapp.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/api/auth/discord/callback`;
const getAvatarUrl = (user: DiscordUser, size = 128) => {
  if (!user.avatar) {
    const defaultAvatarNumber = parseInt(user.discriminator) % 5;
    return `${DISCORD_CDN_URL}/embed/avatars/${defaultAvatarNumber}.png`;
  }
  return `${DISCORD_CDN_URL}/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=${size}`;
};

// Size classes
const sizeClasses = {
  sm: {
    button: "px-4 min-w-20 justify-center py-2 text-sm",
    card: "px-4 py-2",
    icon: "w-4 h-4",
  },
  md: {
    button: "px-6 py-3 w-full justify-center text-base",
    card: "p-4",
    icon: "w-5 h-5",
  },
  lg: {
    button: "px-8 py-4 w-full justify-center text-lg",
    card: "p-4",
    icon: "w-6 h-6",
  },
};

export default function DiscordLogin({
  scopes = DEFAULT_SCOPES,
  variant = "button",
  size = "md",
  onLoginComplete,
  onLoginError,
  className = "",
  redirectUri = REDIRECT_URI,
  btnTitle = "Login",
}: DiscordLoginProps) {
  const { user, authState, error, login, logout } = useDiscordAuth();

  // Notify parent components of state changes
  useEffect(() => {
    if (authState === "success" && user) {
      onLoginComplete?.(user);
    }
  }, [authState, user, onLoginComplete]);

  useEffect(() => {
    if (error) {
      onLoginError?.(error);
    }
  }, [error, onLoginError]);

  // Loading state
  if (authState === "loading") {
    if (variant === "button") {
      return (
        <button
          disabled
          className={`
            bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-all duration-200
          flex items-center space-x-2 border-0
          ${sizeClasses[size].button} ${className}
          `}
        >
          <Loading variant="minimal" size="sm" className="border-t-white" />
        </button>
      );
    }

    return <CardLogin showPermissions size={size} className={className} onClick={() => {}} state={authState} />;
  }

  // Authenticating state
  if (authState === "authenticating") {
    if (variant === "button") {
      return (
        <button
          disabled
          className={`
            bg-blue-600 text-white font-semibold rounded-lg 
            flex items-center space-x-2 border-0 cursor-not-allowed
            ${sizeClasses[size].button} ${className}
          `}
        >
          <Loading variant="minimal" size="md" color="purple" />
          <span>Authenticating...</span>
        </button>
      );
    }

    return <CardLogin size={size} showPermissions className={className} onClick={() => {}} state={authState} />;
  }

  // Success state (logged in)
  if (authState === "success" && user) {
    if (variant === "button") {
      return <SuccessBtn size={size} user={user} handleLogout={logout} className={className} />;
    }

    return <CardLogin size={size} className={className} onClick={() => logout()} state={authState} user={user} />;
  }

  // Error state
  if (authState === "error") {
    if (variant === "button") {
      return (
        <button
          onClick={() => {
            // Clear error through context would need refreshUser or similar
            login(scopes, redirectUri);
          }}
          className={`
            bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg 
            flex items-center space-x-2 border-0
            ${sizeClasses[size].button} ${className}
          `}
        >
          <AlertCircle className={sizeClasses[size].icon} />
          <span>Retry Login</span>
        </button>
      );
    }

    return (
      <div className={`bg-slate-800 border border-red-600 rounded-xl ${sizeClasses[size].card} ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Login Failed</h3>
          <p className="text-red-400 mb-6">{error}</p>

          <button
            onClick={() => {
              login(scopes, redirectUri);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Idle state (show login interface)
  if (variant === "button") {
    return (
      <button
        onClick={() => login(scopes, redirectUri)}
        className={`
          bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-all duration-200
          flex items-center space-x-2 border-0
          ${sizeClasses[size].button} ${className}
        `}
      >
        <LogIn className={sizeClasses[size].icon} />
        <span>{btnTitle}</span>
      </button>
    );
  }

  // Card variant - idle state
  return (
    <CardLogin size={size} showPermissions className={className} onClick={() => login(scopes, redirectUri)} state={authState} />
  );
}

// Convenience components
export const DiscordLoginButton = (props: Omit<DiscordLoginProps, "variant">) => <DiscordLogin variant="button" {...props} />;

export const DiscordLoginCard = (props: Omit<DiscordLoginProps, "variant">) => <DiscordLogin variant="card" {...props} />;

const permissionDescriptions = {
  identify: "Access to your Discord username, avatar, and ID",
  email: "Access to your email address",
  guilds: "View Discord servers you're in",
  "guilds.join": "Join Discord servers on your behalf",
  connections: "View connected accounts (Spotify, Steam, etc.)",
  bot: "Add bots to servers",
};

const ClassMap = {
  success: {
    class:
      "w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2",
    text: "Logout",
  },
  idle: {
    class:
      "w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2",
    text: "Log in with Discord",
  },
  authenticating: {
    class:
      "w-full bg-gray-800/80  text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2",
    text: "Authenticating...",
  },
  loading: {
    class:
      "w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2",
    text: "Loading...",
  },
};
const CardLogin = ({
  showPermissions = false,
  size = "lg",
  className,
  scopes = DEFAULT_SCOPES,
  onClick,
  user,
  state,
}: DiscordLoginProps & { onClick: () => void; user?: DiscordUser; state: "success" | "idle" | "authenticating" | "loading" }) => {
  // Fixed dimensions for card variant
  const cardDimensions =
    size === "lg"
      ? "min-h-[500px] max-w-100"
      : size === "md"
        ? "w-80 h-[450px] min-h-[450px] max-w-80"
        : "w-72 h-[400px] min-h-[400px] max-w-72";

  return (
    <div
      className={`
      bg-slate-800 border border-slate-700 rounded-xl
      ${cardDimensions}
      ${sizeClasses[size].card} ${className}
      mx-auto flex flex-col justify-center
    `}
    >
      <div className="text-center flex flex-col justify-center h-full">
        {user ? (
          <UserInCard user={user} />
        ) : (
          <>
            <div className="w-16 h-16 bg-[#5865F2] rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-bold text-white mb-4">Connect Discord Account</h3>
            <p className="text-slate-400 mb-8 px-4">
              Login with your Discord account to access personalized features and sync your preferences.
            </p>
          </>
        )}

        {showPermissions && !user && (
          <div className="bg-slate-700 rounded-lg p-4 mb-6 text-left mx-4">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Permissions Required
            </h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {scopes.map((scope) => (
                <li key={scope} className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span className="text-xs">{permissionDescriptions[scope as keyof typeof permissionDescriptions] || scope}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="px-4 mt-auto mb-4">
          <button onClick={onClick} disabled={["loading", "authenticating"].includes(state)} className={ClassMap[state].class}>
            {["authenticating", "loading"].includes(state) && <Loading variant="minimal" size="sm" />}
            {state === "idle" && <LogIn className="w-5 h-5" />}
            <span>{ClassMap[state].text}</span>
            {state === "success" && <LogOut className="w-5 h-5" />}
          </button>

          {state !== "success" && (
            <p className="text-xs text-slate-500 mt-4">By connecting, you agree to our Terms of Service and Privacy Policy</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UserInCard = ({ user }: { user: DiscordUser }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative mb-6">
        <img
          src={getAvatarUrl(user, 80)}
          alt={`${user.username}'s avatar`}
          className="w-20 h-20 rounded-full border-4 border-green-500"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-slate-800 rounded-full"></div>
      </div>

      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-white">{user.username}</h3>
        {user.discriminator !== "0" && <p className="text-slate-400">#{user.discriminator}</p>}
      </div>

      <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm mb-8">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Successfully connected</span>
      </div>
    </div>
  );
};

const SuccessBtn = ({
  size,
  user,
  className,
  handleLogout,
}: {
  user: DiscordUser;
  size: "sm" | "md" | "lg";
  className?: string;
  handleLogout: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return size === "sm" ? (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
              bg-green-500/10 border border-green-500/30 rounded-lg 
              flex items-center space-x-2 transition-all duration-200
              hover:bg-green-500/20 w-full
              ${sizeClasses[size].card} ${className}
            `}
      >
        <img src={getAvatarUrl(user, 32)} alt={`${user.username}'s avatar`} className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 text-left">
          <p className="font-semibold text-white text-sm truncate">
            {user.username}#{user.discriminator}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => {
                handleLogout();
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-md transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div
      className={`bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-3 ${sizeClasses[size].card} ${className}`}
    >
      <img src={getAvatarUrl(user, 32)} alt={`${user.username}'s avatar`} className="w-8 h-8 rounded-full" />
      <div className="flex-1">
        <p className="font-semibold text-white text-sm">
          {user.username}#{user.discriminator}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="px-2 py-1 bg-red-600 hover:bg-red-700 cursor-pointer text-white rounded text-xs transition-colors"
      >
        {" "}
        Logout
      </button>
    </div>
  );
};
