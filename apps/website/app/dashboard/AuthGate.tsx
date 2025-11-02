"use client";
import React from "react";
import { usePathname } from "next/navigation";
import ScopeAuthGate from "../../components/auth/AuthGate";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <ScopeAuthGate routePath={pathname}>{children}</ScopeAuthGate>;
}
