"use client";

import { useState } from "react";
import type { PlannerBreakdownData, FilterType } from "../types";
import StatsOverview from "./StatsOverview";
import CategoryTabs from "./CategoryTabs";
import CurrencyChart from "./CurrencyChart";
import ItemsList from "./ItemsList";
import ExportButtons from "./ExportButtons";
import FilterPanel from "./FilterPanel";

interface Props {
  data: PlannerBreakdownData;
}

export default function PlannerBreakdownView({ data }: Props) {
  const [activeTab, setActiveTab] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get the appropriate breakdown data based on active tab
  const getBreakdownData = () => {
    switch (activeTab) {
      case "regular":
        return data.breakdown.regular;
      case "seasons":
        return {
          ...data.breakdown.total,
          items: {
            nodes: data.breakdown.seasons.flatMap((s) => s.items.nodes),
            shopItems: data.breakdown.seasons.flatMap((s) => s.items.shopItems),
            iaps: data.breakdown.seasons.flatMap((s) => s.items.iaps),
          },
        };
      case "events":
        return {
          ...data.breakdown.total,
          items: {
            nodes: data.breakdown.events.flatMap((e) => e.items.nodes),
            shopItems: data.breakdown.events.flatMap((e) => e.items.shopItems),
            iaps: data.breakdown.events.flatMap((e) => e.items.iaps),
          },
        };
      default:
        return data.breakdown.total;
    }
  };

  const breakdownData = getBreakdownData();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">📊 Planner Breakdown</h1>
        <p className="text-slate-400">Detailed analysis of your Sky: Children of the Light collection</p>
      </div>

      {/* User Info */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6 flex items-center gap-4">
        {data.user.avatar && (
          <img
            src={`https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png?size=128`}
            alt={data.user.username}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-white">{data.user.username}</h2>
          <p className="text-slate-400">Discord ID: {data.user.id}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview progress={data.progress} currencies={data.currencies} />

      {/* Category Tabs */}
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} breakdown={data.breakdown} />

      {/* Export Buttons */}
      <div className="mb-6">
        <ExportButtons data={data} activeTab={activeTab} />
      </div>

      {/* Currency Chart */}
      <div className="mb-6">
        <CurrencyChart breakdown={breakdownData} />
      </div>

      {/* Filter Panel */}
      <FilterPanel searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Items List */}
      <ItemsList breakdown={breakdownData} searchTerm={searchTerm} activeTab={activeTab} fullBreakdown={data.breakdown} />
    </div>
  );
}
