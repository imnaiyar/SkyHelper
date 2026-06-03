"use client";
import React from "react";
import AuthGate from "./AuthGate";
import Sidebar from "./components/Sidebar";
import Breadcrumb from "./components/Breadcrumb";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <QueryClientProvider client={queryClient}>
        <div className="relative min-h-screen">
          <div className="flex flex-col md:flex-row gap-4 py-4">
            <div className="hidden md:block flex-shrink-0">
              <Sidebar />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <Sidebar />

              <Breadcrumb />
            </div>

            <div className="flex-1 min-w-0 ml-0 md:ml-4">
              <main
                className="bg-white/5
  border border-white/10
  backdrop-blur-xl
  shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-xl min-h-[calc(100vh-2rem)]"
              >
                <div className="relative overflow-hidden p-6 md:p-8">
                  <div className="hidden md:block sm:mb-4">
                    <Breadcrumb />
                  </div>
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </AuthGate>
  );
}
