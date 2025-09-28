"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label?: string;
  href?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const routeMap: Record<string, string> = {
  dashboard: "Overview",
  activity: "Activity",
  "linked-role": "Linked Role",
  profile: "Profile",
};

export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from the current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home
    breadcrumbs.push({
      href: "/dashboard",
      icon: Home,
    });

    let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      if (segment === "dashboard") continue;

      const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = i === segments.length - 1;

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="w-fit p-3 bg-slate-900 border border-slate-700/50 rounded-lg">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.href || item.label} className="flex items-center">
              {index > 0 && <ChevronRight size={16} className="text-slate-500 mx-2" aria-hidden="true" />}

              {item.href ? (
                <Link href={item.href} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                  {Icon && <Icon size={16} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-white font-medium">
                  {Icon && <Icon size={16} />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
