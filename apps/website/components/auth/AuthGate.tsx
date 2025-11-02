"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useDiscordAuth } from "./DiscordAuthContext";
import DiscordLogin from "./DiscordLogin";
import { DiscordScope, ScopeValidationResult } from "@/lib/auth/types";
import { validateUserScopes, validateUserScopesForRoute, getRequiredScopesForRoute } from "@/lib/auth/scopes";
import Loading from "../ui/Loading";

interface ScopeAuthGateProps {
  children: React.ReactNode;
  requiredScopes?: DiscordScope[];
  routePath?: string;
  fallback?: React.ReactNode;
  showPermissions?: boolean;
}

export default function AuthGate({ children, requiredScopes, routePath, fallback, showPermissions = true }: ScopeAuthGateProps) {
  const { user, authState } = useDiscordAuth();
  const currentPath = usePathname();
  const pathForValidation = routePath || currentPath;

  const scopesToValidate = requiredScopes || getRequiredScopesForRoute(pathForValidation);

  if (authState === "loading") return <Loading variant="bot" className="p-56" />;

  if (!user) {
    return (
      <div className="py-12">
        <DiscordLogin variant="card" className="w-100" scopes={scopesToValidate} showPermissions={showPermissions} />
      </div>
    );
  }

  // Validate scopes
  const validation: ScopeValidationResult = requiredScopes
    ? validateUserScopes(user, requiredScopes)
    : validateUserScopesForRoute(user, pathForValidation);

  if (validation.isValid) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Additional Permissions Required</h2>
          <p className="text-slate-400">
            This page requires additional permissions that weren't granted during your initial login.
          </p>
        </div>

        <DiscordLogin
          variant="card"
          className="w-100"
          scopes={scopesToValidate}
          missingScopes={validation.missingScopes}
          showPermissions={showPermissions}
          btnTitle="Re-authenticate"
        />

        {validation.missingScopes.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Missing scope(s):</strong> {validation.missingScopes.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A simpler component that only checks if user is authenticated,
 * without scope validation.
 */
export function BasicAuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useDiscordAuth();

  if (!user) {
    return (
      <div className="py-12">
        <DiscordLogin variant="card" className="w-100" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check scope requirements for current route
 */
export function useScopeValidation(requiredScopes?: DiscordScope[]) {
  const { user } = useDiscordAuth();
  const currentPath = usePathname();

  const validation = requiredScopes ? validateUserScopes(user, requiredScopes) : validateUserScopesForRoute(user, currentPath);

  return {
    ...validation,
    hasAccess: validation.isValid,
    needsReauth: !validation.isValid,
  };
}
