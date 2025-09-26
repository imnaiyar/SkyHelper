import React from "react";
import AuthGate from "./AuthGate";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
