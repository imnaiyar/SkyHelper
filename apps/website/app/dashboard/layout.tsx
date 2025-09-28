import React from "react";
import AuthGate from "./AuthGate";
import Sidebar from "./components/Sidebar";
import Breadcrumb from "./components/Breadcrumb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="relative bg-slate-900 min-h-screen">
        <div className="flex flex-col md:flex-row gap-4 py-4">
          <div className="hidden md:block flex-shrink-0">
            <Sidebar />
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Sidebar />

            <Breadcrumb />
          </div>

          <div className="flex-1 min-w-0 ml-0 md:ml-4">
            <main className=" bg-slate-800/50 border border-slate-700/50 rounded-xl min-h-[calc(100vh-2rem)]">
              <div className="p-6 md:p-8">
                <div className="hidden md:block sm:mb-4">
                  <Breadcrumb />
                </div>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
