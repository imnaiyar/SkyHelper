"use client";

import { useToast } from "@/app/hooks/useToast";
import { AuthUser, DiscordScope, BASE_SCOPES } from "@/app/lib/auth/types";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AuthState = "idle" | "loading" | "authenticating" | "success" | "error" | "redirecting";

interface DiscordAuthContextType {
  user: AuthUser | null;
  authState: AuthState;
  error: string | null;
  login: (scopes?: DiscordScope[], redirectUri?: string) => void;
  logout: () => void;
}

const DiscordAuthContext = createContext<DiscordAuthContextType | undefined>(undefined);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const REDIRECT_URI = `${BASE_URL}/api/auth/discord/callback`;

interface DiscordAuthProviderProps {
  children: ReactNode;
  user?: AuthUser;
}

export const DiscordAuthProvider: React.FC<DiscordAuthProviderProps> = ({ children, user: u }) => {
  const [user, setUser] = useState<AuthUser | null>(u ?? null);
  const [authState, setAuthState] = useState<AuthState>(u ? "success" : "idle");
  const [error, setError] = useState<string | null>(null);
  const { success, error: terror } = useToast();

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

  const login = (scopes = BASE_SCOPES) => {
    if (!DISCORD_CLIENT_ID) {
      setError("Discord client ID not configured");
      setAuthState("error");
      return;
    }

    if (authState === "authenticating" || authState === "loading" || authState === "redirecting") {
      return; // Prevent multiple simultaneous login attempts
    }

    const state = generateState() + `:${window.location.pathname}`;
    saveState(state);

    setAuthState("redirecting");
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

    // Call server-side logout to clear secure cookies
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch((error) => {
      console.error("Error during logout:", error);
      terror({ message: error.message });
    });

    terror({ title: "Logged out!", duration: 2000 });
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

        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (authState === "loading" || authState === "authenticating" || authState === "redirecting") {
        return; // Already processing
      }

      if (code && state) {
        setAuthState("authenticating");
        const savedState = getAndClearState();
        if (state !== savedState) {
          setError("Invalid state parameter");
          setAuthState("error");

          terror({ title: "Something went wrong!", message: "Invalid state parameter" });
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

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

        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [authState, success, terror]);

  const contextValue: DiscordAuthContextType = {
    user,
    authState,
    error,
    login,
    logout,
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
