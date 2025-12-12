"use client";

import { useState, useMemo } from "react";
import type { BreakdownCost, FilterType } from "../types";

interface Props {
  breakdown: BreakdownCost;
  searchTerm: string;
  activeTab: FilterType;
  fullBreakdown: {
    seasons: any[];
    events: any[];
    eventInstances: any[];
  };
}

export default function ItemsList({ breakdown, searchTerm, activeTab, fullBreakdown }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"name" | "cost">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Combine all items
  const allItems = useMemo(() => {
    const items = [
      ...breakdown.items.nodes.map((node) => ({
        type: "node" as const,
        guid: node.guid,
        name: node.name,
        cost: node.cost,
        totalCost:
          (node.cost.candles || 0) +
          (node.cost.hearts || 0) +
          (node.cost.seasonCandles || 0) +
          (node.cost.seasonHearts || 0) +
          (node.cost.ascendedCandles || 0) +
          (node.cost.eventCurrency || 0),
        spirit: node.spirit?.name || "Unknown",
        imageUrl: node.spirit?.imageUrl,
      })),
      ...breakdown.items.shopItems.map((item) => ({
        type: "shop" as const,
        guid: item.guid,
        name: item.name,
        cost: item.cost,
        totalCost:
          (item.cost.candles || 0) +
          (item.cost.hearts || 0) +
          (item.cost.seasonCandles || 0) +
          (item.cost.seasonHearts || 0) +
          (item.cost.ascendedCandles || 0) +
          (item.cost.eventCurrency || 0),
        shop: item.shop,
        quantity: item.quantity,
      })),
      ...breakdown.items.iaps.map((iap) => ({
        type: "iap" as const,
        guid: iap.guid,
        name: iap.name,
        cost: { candles: 0, hearts: 0, seasonCandles: 0, seasonHearts: 0, ascendedCandles: 0, eventCurrency: 0 },
        totalCost: 0,
        price: iap.price,
      })),
    ];

    return items;
  }, [breakdown]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;

    const term = searchTerm.toLowerCase();
    return allItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const spiritMatch = item.type === "node" && item.spirit.toLowerCase().includes(term);
      const shopMatch = item.type === "shop" && item.shop.toLowerCase().includes(term);
      return nameMatch || spiritMatch || shopMatch;
    });
  }, [allItems, searchTerm]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    sorted.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else {
        const aTotal = a.type === "iap" ? a.price : a.totalCost;
        const bTotal = b.type === "iap" ? b.price : b.totalCost;
        return sortOrder === "asc" ? aTotal - bTotal : bTotal - aTotal;
      }
    });
    return sorted;
  }, [filteredItems, sortBy, sortOrder]);

  // Paginate items
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  const formatCost = (cost: any) => {
    const parts = [];
    if (cost.candles) parts.push(`🕯️ ${cost.candles}`);
    if (cost.hearts) parts.push(`❤️ ${cost.hearts}`);
    if (cost.seasonCandles) parts.push(`❄️ ${cost.seasonCandles}`);
    if (cost.seasonHearts) parts.push(`💖 ${cost.seasonHearts}`);
    if (cost.ascendedCandles) parts.push(`🔺 ${cost.ascendedCandles}`);
    if (cost.eventCurrency) parts.push(`🎫 ${cost.eventCurrency}`);
    return parts.length > 0 ? parts.join(" ") : "Free";
  };

  if (allItems.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        <div className="text-slate-400 text-lg">No items found for this category.</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          📦 Items List
          <span className="text-slate-400 text-lg ml-2">({sortedItems.length} items)</span>
        </h2>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "cost")}
            className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="cost">Sort by Cost</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-700 transition-colors"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div
            key={item.guid}
            className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {item.type === "node" && item.imageUrl && (
                    <img src={item.imageUrl} alt={item.spirit} className="w-10 h-10 rounded object-cover" />
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{item.name}</h3>
                    {item.type === "node" && <div className="text-sm text-slate-400">Spirit: {item.spirit}</div>}
                    {item.type === "shop" && (
                      <div className="text-sm text-slate-400">
                        {item.shop} {item.quantity > 1 && `× ${item.quantity}`}
                      </div>
                    )}
                    {item.type === "iap" && <div className="text-sm text-slate-400">In-App Purchase</div>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {item.type === "iap" ? (
                  <div className="text-green-400 font-bold text-lg">${item.price.toFixed(2)}</div>
                ) : (
                  <div className="text-slate-300">{formatCost(item.cost)}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary by Category */}
      {activeTab === "all" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Seasons</div>
            <div className="text-2xl font-bold text-blue-400">{fullBreakdown.seasons.length}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Events</div>
            <div className="text-2xl font-bold text-purple-400">{fullBreakdown.events.length}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Event Instances</div>
            <div className="text-2xl font-bold text-pink-400">{fullBreakdown.eventInstances.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
