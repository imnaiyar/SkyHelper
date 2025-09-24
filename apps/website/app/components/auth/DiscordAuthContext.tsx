"use client";

import { useToast } from "@/app/hooks/useToast";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
}

type AuthState = "idle" | "loading" | "authenticating" | "success" | "error";

interface DiscordAuthContextType {
  user: DiscordUser | null;
  authState: AuthState;
  error: string | null;
  login: (scopes?: string[], redirectUri?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DiscordAuthContext = createContext<DiscordAuthContextType | undefined>(undefined);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const REDIRECT_URI = `${BASE_URL}/api/auth/discord/callback`;
const DEFAULT_SCOPES = ["identify", "guilds"];

interface DiscordAuthProviderProps {
  children: ReactNode;
}

export const DiscordAuthProvider: React.FC<DiscordAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [error, setError] = useState<string | null>(null);
  const { success, error: terror, info, warning } = useToast();

  // Track ongoing requests to prevent duplicates
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateState = () => {
    return btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const saveState = (state: string) => {
    sessionStorage.setItem("discord_auth_state", state);
  };

  const getAndClearState = () => {
    const state = sessionStorage.getItem("discord_auth_state");
    sessionStorage.removeItem("discord_auth_state");
    return state;
  };

  const login = (scopes = DEFAULT_SCOPES) => {
    if (!DISCORD_CLIENT_ID) {
      setError("Discord client ID not configured");
      setAuthState("error");
      return;
    }

    if (authState === "authenticating" || authState === "loading") {
      return; // Prevent multiple simultaneous login attempts
    }

    const state = generateState() + `:${window.location.pathname}`;
    saveState(state);

    setAuthState("loading");
    setError(null);

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: scopes.join(" "),
      state: state,
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
  };

  const logout = () => {
    setUser(null);
    setAuthState("idle");
    setError(null);
    localStorage.removeItem("discord_user");
    sessionStorage.removeItem("discord_auth_state");
    terror({ title: "Logged out!", duration: 2000 });
  };

  const refreshUser = async () => {
    if (isRefreshing) {
      return; // Prevent duplicate refresh requests
    }

    setIsRefreshing(true);

    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAuthState("success");
        localStorage.setItem("discord_user", JSON.stringify(userData));
      } else {
        setUser(null);
        setAuthState("idle");
        localStorage.removeItem("discord_user");
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      /* @ts-expect-error well */
      terror({ title: "Something went wrong!", message: error.message ?? error.statusText ?? error });
      setUser(null);
      setAuthState("idle");
      localStorage.removeItem("discord_user");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      setError(null);
      if (error) {
        setError(decodeURIComponent(error));
        setAuthState("error");

        terror({ title: "Something went wrong!", message: error });
        // Clean up URL without triggering navigation
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (authState === "loading" || authState === "authenticating") {
        return; // Already processing
      }

      if (code && state) {
        const savedState = getAndClearState();
        if (state !== savedState) {
          setError("Invalid state parameter");
          setAuthState("error");

          terror({ title: "Something went wrong!", message: "Invalid state parameter" });
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        setAuthState("authenticating");

        try {
          const response = await fetch("/api/auth/discord/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ code, redirectUri: `${window.location.origin}${window.location.pathname}` }),
          });

          const data = await response.json();
          if (response.ok) {
            setUser(data);
            localStorage.setItem("discord_user", JSON.stringify(data));
            setAuthState("success");
            success({ title: "Logged In!" });
          } else {
            setError(data.error || "Authentication failed");
            setAuthState("error");
          }
        } catch (error) {
          console.error("OAuth callback error:", error);
          setError("Authentication failed");
          setAuthState("error");
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [authState]);

  // Load user from localStorage on mount
  useEffect(() => {
    setAuthState("loading");
    const savedUser = localStorage.getItem("discord_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setAuthState("success");
        // Refresh user data in background
        refreshUser();
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("discord_user");
      }
    } else setAuthState("idle");
  }, []);

  const contextValue: DiscordAuthContextType = {
    user,
    authState,
    error,
    login,
    logout,
    refreshUser,
  };

  return <DiscordAuthContext.Provider value={contextValue}>{children}</DiscordAuthContext.Provider>;
};

export const useDiscordAuth = (): DiscordAuthContextType => {
  const context = useContext(DiscordAuthContext);
  if (context === undefined) {
    throw new Error("useDiscordAuth must be used within a DiscordAuthProvider");
  }
  return context;
};
