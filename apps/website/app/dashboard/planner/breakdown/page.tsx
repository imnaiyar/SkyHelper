"use client";

import { useUserQuery } from "@/app/hooks/discord";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/app/components/ui/Loading";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { currency } from "@skyhelperbot/constants";
import { useSession } from "@/app/hooks/auth";

// Define types
interface ICost {
  c?: number;
  h?: number;
  sc?: number;
  sh?: number;
  ac?: number;
  ec?: number;
}

interface IItem {
  name: string;
  type: string;
  emoji?: string;
}

interface INode {
  item?: IItem;
  c?: number;
  h?: number;
  ac?: number;
  ec?: number;
  sc?: number;
  sh?: number;
}

interface IItemListNode {
  item: IItem;
  quantity?: number;
  c?: number;
  h?: number;
  ac?: number;
  ec?: number;
  sc?: number;
  sh?: number;
}

interface IIAP {
  name: string;
  price?: number;
}

interface IBreakdownInstanceCost {
  cost: ICost;
  name?: string;
  price: number;
  nodes: INode[];
  listNodes: IItemListNode[];
  iaps: IIAP[];
}

interface IBreakdownData {
  total: IBreakdownInstanceCost;
  regular: IBreakdownInstanceCost;
  seasons: Record<string, IBreakdownInstanceCost>;
  events: Record<string, IBreakdownInstanceCost>;
  eventInstances: Record<string, IBreakdownInstanceCost>;
}

const COLORS = ["#FFD700", "#FF69B4", "#FF4500", "#00C49F", "#0088FE", "#FFBB28"];

type SortField = "name" | "c" | "h" | "ac" | "sc" | "sh" | "ec" | "price";
type SortDirection = "asc" | "desc";

export default function PlannerBreakdownPage() {
  const { data: user, isLoading: userLoading } = useUserQuery();
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<"total" | "regular" | "seasons" | "events">("total");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: breakdown,
    isLoading: breakdownLoading,
    error,
  } = useQuery<IBreakdownData>({
    queryKey: ["plannerBreakdown", user?.id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/planner/breakdown`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch breakdown");
      return res.json();
    },
    enabled: !!user?.id && !!session?.access_token,
  });

  const currentData = useMemo(() => {
    if (!breakdown) return null;
    if (activeTab === "total") return breakdown.total;
    if (activeTab === "regular") return breakdown.regular;

    if (activeTab === "seasons") {
      if (selectedSeason && breakdown.seasons[selectedSeason]) {
        return breakdown.seasons[selectedSeason];
      }
      // Aggregate all seasons
      const agg: IBreakdownInstanceCost = { cost: {}, price: 0, nodes: [], listNodes: [], iaps: [] };
      Object.values(breakdown.seasons).forEach((s) => mergeCosts(agg, s));
      return agg;
    }
    if (activeTab === "events") {
      if (selectedEvent && breakdown.events[selectedEvent]) {
        return breakdown.events[selectedEvent];
      }
      // Aggregate all events
      const agg: IBreakdownInstanceCost = { cost: {}, price: 0, nodes: [], listNodes: [], iaps: [] };
      Object.values(breakdown.events).forEach((e) => mergeCosts(agg, e));
      return agg;
    }
    return breakdown.total;
  }, [breakdown, activeTab, selectedSeason, selectedEvent]);

  const sortedItems = useMemo(() => {
    if (!currentData) return [];

    const rawItems = [
      ...currentData.nodes.map((n) => ({ ...n, type: "Spirit Node" })),
      ...currentData.listNodes.map((n) => ({ ...n, type: "Shop Item" })),
      ...currentData.iaps.map((n) => ({ ...n, type: "IAP", cost: {} as ICost })),
    ];

    const aggregatedItems: Record<string, any> = {};
    const otherItems: any[] = [];
    const itemsToAggregate = ["Wing Buff", "Blessing", "Special Blessing", "Heart"];

    rawItems.forEach((item: any) => {
      const name = item.item?.name || item.name;
      if (itemsToAggregate.includes(name)) {
        if (!aggregatedItems[name]) {
          aggregatedItems[name] = {
            ...item,
            quantity: item.quantity || 1,
            type: "Aggregated", // Or keep original type? Maybe 'Aggregated' is better to indicate multiple sources
          };
        } else {
          const agg = aggregatedItems[name];
          agg.quantity = (agg.quantity || 0) + (item.quantity || 1);

          // Sum costs
          agg.c = (agg.c || 0) + (item.c || 0);
          agg.h = (agg.h || 0) + (item.h || 0);
          agg.ac = (agg.ac || 0) + (item.ac || 0);
          agg.sc = (agg.sc || 0) + (item.sc || 0);
          agg.sh = (agg.sh || 0) + (item.sh || 0);
          agg.ec = (agg.ec || 0) + (item.ec || 0);

          agg.price = (agg.price || 0) + (item.price || 0);
        }
      } else {
        otherItems.push(item);
      }
    });

    const allItems = [...Object.values(aggregatedItems), ...otherItems];

    return allItems.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === "name") {
        valA = (a as any).item?.name || (a as any).name || "";
        valB = (b as any).item?.name || (b as any).name || "";
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === "price") {
        valA = (a as any).price || 0;
        valB = (b as any).price || 0;
      } else {
        valA = (a as any).cost?.[sortField] || (a as any)[sortField] || 0;
        valB = (b as any).cost?.[sortField] || (b as any)[sortField] || 0;
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [currentData, sortField, sortDirection]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc for numbers usually
    }
  };

  const downloadCSV = () => {
    if (!currentData) return;

    const rows: (string | number)[][] = [
      ["Type", "Name", "Candles", "Hearts", "AC", "Season Candles", "Season Hearts", "Event Currency", "Price (USD)"],
    ];

    currentData.nodes.forEach((n) => {
      if (n.item) {
        rows.push(["Node", n.item.name, n.c || 0, n.h || 0, n.ac || 0, n.sc || 0, n.sh || 0, n.ec || 0, 0]);
      }
    });

    currentData.listNodes.forEach((n) => {
      rows.push(["Shop Item", n.item.name, n.c || 0, n.h || 0, n.ac || 0, n.sc || 0, n.sh || 0, n.ec || 0, 0]);
    });

    currentData.iaps.forEach((iap) => {
      rows.push(["IAP", iap.name, 0, 0, 0, 0, 0, 0, iap.price || 0]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `planner_breakdown_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (userLoading || breakdownLoading) return <Loading size="lg" variant="bot" />;
  if (error) return <div className="text-red-500 text-center mt-10">Error loading breakdown. Please try again later.</div>;
  if (!breakdown || !currentData) return <div className="text-slate-400 text-center mt-10">No data available</div>;

  const chartData = [
    { name: "Candles", value: currentData.cost.c || 0 },
    { name: "Hearts", value: currentData.cost.h || 0 },
    { name: "AC", value: currentData.cost.ac || 0 },
    { name: "Season Candles", value: currentData.cost.sc || 0 },
    { name: "Season Hearts", value: currentData.cost.sh || 0 },
    { name: "Event Tickets", value: currentData.cost.ec || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Planner Breakdown</h1>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {(["total", "regular", "seasons", "events"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
                setSelectedSeason("");
                setSelectedEvent("");
              }}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${
                activeTab === tab ? "bg-white text-black font-medium" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "seasons" && (
          <select
            className="bg-slate-800 text-white px-4 py-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Seasons</option>
            {Object.entries(breakdown.seasons).map(([guid, season]) => (
              <option key={guid} value={guid}>
                {season.name ?? guid.slice(0, 8)}
              </option>
            ))}
          </select>
        )}

        {activeTab === "events" && (
          <select
            className="bg-slate-800 text-white px-4 py-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Events</option>
            {Object.entries(breakdown.events).map(([guid, event]) => (
              <option key={guid} value={guid}>
                {event.name ?? guid.slice(0, 8)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard
          title="Candles"
          value={currentData.cost.c || 0}
          icon={<img src={`https://cdn.discordapp.com/emojis/${currency.c}.png`} className="w-6 h-6" alt="Candle" />}
        />
        <SummaryCard
          title="Hearts"
          value={currentData.cost.h || 0}
          icon={<img src={`https://cdn.discordapp.com/emojis/${currency.h}.png`} className="w-6 h-6" alt="Heart" />}
        />
        <SummaryCard
          title="Ascended Candles"
          value={currentData.cost.ac || 0}
          icon={<img src={`https://cdn.discordapp.com/emojis/${currency.ac}.png`} className="w-6 h-6" alt="AC" />}
        />
        <SummaryCard
          title="Season Candles"
          value={currentData.cost.sc || 0}
          icon={<img src={`https://cdn.discordapp.com/emojis/${currency.sc}.png`} className="w-6 h-6" alt="Season Candle" />}
          color="text-orange-400"
        />
        <SummaryCard
          title="Season Hearts"
          value={currentData.cost.sh || 0}
          icon={<img src={`https://cdn.discordapp.com/emojis/${currency.sh}.png`} className="w-6 h-6" alt="Season Heart" />}
          color="text-orange-400"
        />
        <SummaryCard title="USD Spent" value={`$${currentData.price.toFixed(2)}`} icon="💵" color="text-green-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Currency Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Cost Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: "#334155", opacity: 0.2 }}
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Detailed Item List</h2>
          <div className="text-sm text-slate-400">
            Showing {paginatedItems.length} of {sortedItems.length} items
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800 text-slate-200 uppercase">
              <tr>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-2">
                    Item <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort("c")}>
                  <div className="flex items-center gap-2">
                    Candles <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort("h")}>
                  <div className="flex items-center gap-2">
                    Hearts <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort("ac")}>
                  <div className="flex items-center gap-2">
                    AC <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort("price")}>
                  <div className="flex items-center gap-2">
                    Price <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-3">Other Costs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedItems.map((item: any, i) => (
                <tr key={`${item.type}-${i}`} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 flex font-medium text-white">
                    {item.item?.icon && <img src={item.item.icon} alt={item.item.name ?? "Icon"} className="w-6 h-6 mr-2" />}
                    {item.item?.name || item.name} {item.quantity ? `x${item.quantity}` : ""}
                  </td>
                  <td className="px-6 py-4">{item.type}</td>
                  <td className="px-6 py-4">{item.cost?.c || item.c ? `${item.cost?.c || item.c}` : "-"}</td>
                  <td className="px-6 py-4">{item.cost?.h || item.h ? `${item.cost?.h || item.h}` : "-"}</td>
                  <td className="px-6 py-4">{item.cost?.ac || item.ac ? `${item.cost?.ac || item.ac}` : "-"}</td>
                  <td className="px-6 py-4 text-green-400">{item.price ? `$${item.price.toFixed(2)}` : "-"}</td>
                  <td className="px-6 py-4">{formatOtherCosts(item.cost || item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatOtherCosts(cost: any) {
  const parts = [];
  if (cost.sc)
    parts.push(
      <span key="sc" className="flex items-center gap-1">
        {cost.sc} <img src={`https://cdn.discordapp.com/emojis/${currency.sc}.png`} className="w-4 h-4" alt="Season Candle" />
      </span>,
    );
  if (cost.sh)
    parts.push(
      <span key="sh" className="flex items-center gap-1">
        {cost.sh} <img src={`https://cdn.discordapp.com/emojis/${currency.sh}.png`} className="w-4 h-4" alt="Season Heart" />
      </span>,
    );
  if (cost.ec)
    parts.push(
      <span key="ec" className="flex items-center gap-1">
        {cost.ec} <img src={`https://cdn.discordapp.com/emojis/${currency.ec}.png`} className="w-4 h-4" alt="Event Ticket" />
      </span>,
    );

  return parts.length > 0 ? <div className="flex flex-wrap gap-2">{parts}</div> : "-";
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color || "text-white"}`}>{value}</div>
    </div>
  );
}

function mergeCosts(target: IBreakdownInstanceCost, source: IBreakdownInstanceCost) {
  target.price += source.price;
  target.cost.c = (target.cost.c || 0) + (source.cost.c || 0);
  target.cost.h = (target.cost.h || 0) + (source.cost.h || 0);
  target.cost.ac = (target.cost.ac || 0) + (source.cost.ac || 0);
  target.cost.sc = (target.cost.sc || 0) + (source.cost.sc || 0);
  target.cost.sh = (target.cost.sh || 0) + (source.cost.sh || 0);
  target.cost.ec = (target.cost.ec || 0) + (source.cost.ec || 0);
  target.nodes.push(...source.nodes);
  target.listNodes.push(...source.listNodes);
  target.iaps.push(...source.iaps);
}

// Removed formatCost as it is replaced by formatOtherCosts and individual columns
