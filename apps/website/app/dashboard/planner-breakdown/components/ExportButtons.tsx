"use client";

import { useState } from "react";
import Papa from "papaparse";
import type { PlannerBreakdownData, FilterType } from "../types";

interface Props {
  data: PlannerBreakdownData;
  activeTab: FilterType;
}

export default function ExportButtons({ data, activeTab }: Props) {
  const [exporting, setExporting] = useState(false);

  const getFilteredData = () => {
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

  const exportToCSV = () => {
    setExporting(true);
    try {
      const breakdown = getFilteredData();

      // Prepare data for CSV
      const csvData = [
        ...breakdown.items.nodes.map((node) => ({
          Type: "Spirit Node",
          Name: node.name,
          Spirit: node.spirit?.name || "Unknown",
          Candles: node.cost.candles || 0,
          Hearts: node.cost.hearts || 0,
          "Season Candles": node.cost.seasonCandles || 0,
          "Season Hearts": node.cost.seasonHearts || 0,
          "Ascended Candles": node.cost.ascendedCandles || 0,
          "Event Currency": node.cost.eventCurrency || 0,
          Price: 0,
        })),
        ...breakdown.items.shopItems.map((item) => ({
          Type: "Shop Item",
          Name: item.name,
          Shop: item.shop,
          Quantity: item.quantity,
          Candles: item.cost.candles || 0,
          Hearts: item.cost.hearts || 0,
          "Season Candles": item.cost.seasonCandles || 0,
          "Season Hearts": item.cost.seasonHearts || 0,
          "Ascended Candles": item.cost.ascendedCandles || 0,
          "Event Currency": item.cost.eventCurrency || 0,
          Price: 0,
        })),
        ...breakdown.items.iaps.map((iap) => ({
          Type: "IAP",
          Name: iap.name,
          Candles: 0,
          Hearts: 0,
          "Season Candles": 0,
          "Season Hearts": 0,
          "Ascended Candles": 0,
          "Event Currency": 0,
          Price: iap.price,
        })),
      ];

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `planner-breakdown-${activeTab}-${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export to CSV failed:", error);
      alert("Failed to export to CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    setExporting(true);
    try {
      const breakdown = getFilteredData();
      const jsonData = {
        exportDate: new Date().toISOString(),
        user: data.user,
        category: activeTab,
        breakdown: breakdown,
      };

      const json = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `planner-breakdown-${activeTab}-${Date.now()}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export to JSON failed:", error);
      alert("Failed to export to JSON. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={exportToCSV}
        disabled={exporting}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>📊</span>
        <span>Export to CSV</span>
      </button>
      <button
        onClick={exportToJSON}
        disabled={exporting}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>💾</span>
        <span>Export to JSON</span>
      </button>
    </div>
  );
}
