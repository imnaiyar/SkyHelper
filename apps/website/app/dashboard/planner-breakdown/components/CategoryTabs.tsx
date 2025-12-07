"use client";

import type { FilterType } from "../types";

interface Props {
  activeTab: FilterType;
  onTabChange: (tab: FilterType) => void;
  breakdown: {
    total: { cost: any; price: number };
    regular: { cost: any; price: number };
    seasons: any[];
    events: any[];
  };
}

export default function CategoryTabs({ activeTab, onTabChange, breakdown }: Props) {
  const tabs: Array<{ id: FilterType; label: string; count?: number }> = [
    { id: "all", label: "All Items" },
    { id: "regular", label: "Regular" },
    { id: "seasons", label: "Seasons", count: breakdown.seasons.length },
    { id: "events", label: "Events", count: breakdown.events.length },
  ];

  return (
    <div className="mb-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-2 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-slate-900/50 rounded-full text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
