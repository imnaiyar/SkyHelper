"use client";

import { useState, useEffect, useRef } from "react";
import { LogIn, ExternalLink, Shield, Bot, CheckCircle, AlertCircle, LogOut, ChevronDown, User } from "lucide-react";
import Loading from "../ui/Loading";
import { AuthState, useDiscordAuth } from "./DiscordAuthContext";
import { AuthUser, DiscordScope, BASE_SCOPES, DISCORD_SCOPES } from "@/app/lib/auth/types";
import Image from "next/image";

interface DiscordLoginProps {
  redirectUri?: string;
  scopes?: DiscordScope[];
  variant?: "button" | "card";
  size?: "sm" | "md" | "lg";
  showPermissions?: boolean;
  onLoginComplete?: (user: AuthUser) => void;
  onLoginError?: (error: string) => void;
  className?: string;
  btnTitle?: string;
  /** Missing scopes to highlight in yellow */
  missingScopes?: DiscordScope[];
}

const DISCORD_CDN_URL = "https://cdn.discordapp.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/api/auth/discord/callback`;
const getAvatarUrl = (user: AuthUser, size = 128) => {
  if (!user.avatar) {
    const defaultAvatarNumber = parseInt(user.discriminator) % 5;
    return `${DISCORD_CDN_URL}/embed/avatars/${defaultAvatarNumber}.png`;
  }
  return `${DISCORD_CDN_URL}/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=${size}`;
};

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
  scopes = BASE_SCOPES,
  variant = "button",
  size = "md",
  onLoginComplete,
  onLoginError,
  className = "",
  redirectUri = REDIRECT_URI,
  btnTitle = "Login",
  missingScopes = [],
}: DiscordLoginProps) {
  const { user, authState, error, login, logout } = useDiscordAuth();

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
  if (authState === "loading" || authState === "redirecting") {
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
  }

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
  }

  if (authState === "success" && user) {
    if (variant === "button") {
      return <SuccessBtn size={size} user={user} handleLogout={logout} className={className} />;
    }
  }

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

  return (
    <CardLogin
      size={size}
      scopes={scopes}
      missingScopes={missingScopes}
      showPermissions
      className={className}
      btnTitle={btnTitle}
      user={user ?? undefined}
      onClick={() => (authState === "success" && !missingScopes.length ? logout() : login(scopes, redirectUri))}
      state={authState}
    />
  );
}

export const DiscordLoginButton = (props: Omit<DiscordLoginProps, "variant">) => <DiscordLogin variant="button" {...props} />;

export const DiscordLoginCard = (props: Omit<DiscordLoginProps, "variant">) => <DiscordLogin variant="card" {...props} />;

const getScopeDescription = (scope: DiscordScope): string => {
  return DISCORD_SCOPES[scope] || scope;
};

const ClassMap = {
  redirecting: {
    class:
      "w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2",
    text: "Redirecting",
  },

  error: {
    class:
      "w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2",
    text: "Retry",
  },

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
      "w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2",
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
  scopes = BASE_SCOPES,
  onClick,
  user,
  btnTitle,
  state,
  missingScopes = [],
}: DiscordLoginProps & { onClick: () => void; user?: AuthUser; state: AuthState }) => {
  // Fixed dimensions for card variant
  const cardDimensions =
    size === "lg"
      ? "min-h-[500px] min-w-100"
      : size === "md"
        ? "w-80 min-h-[450px] min-w-80"
        : "w- 72 h-[400px] min-h-[400px] min-w-72";

  return (
    <div
      className={`
      bg-slate-800 border border-slate-700 rounded-xl
      ${cardDimensions}
      ${sizeClasses[size].card} 
      mx-auto flex flex-col justify-center
      ${className}
    `}
    >
      <div className="text-center flex flex-col justify-center h-full">
        {user && !missingScopes.length ? (
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

        {showPermissions && (!user || missingScopes.length) && (
          <div className="bg-slate-700 rounded-lg p-4 mb-6 text-left mx-4">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Permissions Required
            </h4>
            <ul className="text-sm space-y-1">
              {scopes.map((scope) => {
                const isMissing = missingScopes.includes(scope);
                return (
                  <li key={scope} className="flex items-start">
                    <span className={`mr-2 ${isMissing ? "text-yellow-400" : "text-green-400"}`}>•</span>
                    <span className={`text-xs ${isMissing ? "text-yellow-400" : "text-slate-300"}`}>
                      {getScopeDescription(scope)}
                      {isMissing && <span className="ml-1 text-yellow-500">(missing)</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
            {missingScopes.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                Additional permissions required. Please re-authenticate to grant missing permissions.
              </div>
            )}
          </div>
        )}

        <div className="px-4 mt-auto mb-4">
          <button
            onClick={onClick}
            disabled={["loading", "authenticating", "redirecting"].includes(state)}
            className={ClassMap[state].class}
          >
            {["authenticating", "loading", "redirecting"].includes(state) && (
              <Loading variant="minimal" size="sm" className="border-t-white" />
            )}
            {state === "idle" && <LogIn className="w-5 h-5" />}
            <span>{missingScopes.length ? "Re-authenticate" : (state === "idle" && btnTitle) || ClassMap[state].text}</span>
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

const UserInCard = ({ user }: { user: AuthUser }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative mb-6">
        <Image
          height={24}
          width={24}
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
  user: AuthUser;
  size: "sm" | "md" | "lg";
  className?: string;
  handleLogout: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <Image
          height={32}
          width={32}
          src={getAvatarUrl(user, 32)}
          alt={`${user.username}'s avatar`}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
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
      <Image
        height={32}
        width={32}
        src={getAvatarUrl(user, 32)}
        alt={`${user.username}'s avatar`}
        className="w-8 h-8 rounded-full"
      />
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
