"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Shield, Menu, X, ExternalLink, User, Activity } from "lucide-react";
const main = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: Home,
    description: "Dashboard home",
  },
  {
    href: "/dashboard/activity",
    label: "Activity",
    icon: Activity,
    description: "Recent activity",
  },
];

const user = [
  {
    href: "/dashboard/linked-role",
    label: "Linked Role",
    icon: Shield,
    description: "Discord role connections",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
    description: "Your Sky profile",
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 items-center gap-2 flex border bg-slate-900 border-slate-700/50 rounded-lg text-white hover:bg-slate-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {" "}
        Menu
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />}

      <aside
        className={`
          fixed md:sticky top-20 left-0 w-80  bg-slate-900 border border-slate-700/50 rounded-xl
          transform transition-transform duration-300 ease-in-out z-50 md:z-0
          ${isOpen ? "translate-x-0 left-4" : "-translate-x-full md:translate-x-0"}
          md:block overflow-y-auto
        `}
      >
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Dashboard</h2>
            </div>
            <p className="text-slate-400 text-sm">Manage your Sky: Children of the Light experience</p>
          </div>

          <nav className="space-y-2">
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3 px-2">Navigation</h3>
              {main.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${
                        active
                          ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`
                        transition-colors
                        ${active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"}
                      `}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${active ? "text-blue-400" : ""}`}>{link.label}</div>
                      <div className="text-xs text-slate-500 truncate">{link.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3 px-2">User</h3>
              {user.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${
                        active
                          ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`
                        transition-colors
                        ${active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"}
                      `}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${active ? "text-blue-400" : ""}`}>{link.label}</div>
                      <div className="text-xs text-slate-500 truncate">{link.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="px-2">
              <p className="text-xs text-slate-500 mb-2">SkyHelper Dashboard</p>
              <p className="text-xs text-slate-600">Your companion for Sky: Children of the Light</p>
            </div>
          </div> */}
        </div>
      </aside>
    </>
  );
}
