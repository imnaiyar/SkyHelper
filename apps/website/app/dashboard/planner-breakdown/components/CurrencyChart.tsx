"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { BreakdownCost } from "../types";

interface Props {
  breakdown: BreakdownCost;
}

export default function CurrencyChart({ breakdown }: Props) {
  const { cost, price } = breakdown;

  const currencyData = [
    { name: "Candles", value: cost.candles, color: "#fb923c" },
    { name: "Hearts", value: cost.hearts, color: "#f87171" },
    { name: "Season Candles", value: cost.seasonCandles, color: "#60a5fa" },
    { name: "Season Hearts", value: cost.seasonHearts, color: "#f472b6" },
    { name: "Ascended Candles", value: cost.ascendedCandles, color: "#22d3ee" },
    { name: "Event Currency", value: cost.eventCurrency, color: "#a78bfa" },
  ].filter((item) => item.value > 0);

  const barData = [
    { name: "Candles", value: cost.candles },
    { name: "Hearts", value: cost.hearts },
    { name: "SC", value: cost.seasonCandles },
    { name: "SH", value: cost.seasonHearts },
    { name: "AC", value: cost.ascendedCandles },
    { name: "EC", value: cost.eventCurrency },
  ].filter((item) => item.value > 0);

  const totalCurrencySpent = currencyData.reduce((sum, item) => sum + item.value, 0);

  if (totalCurrencySpent === 0 && price === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">💰 Currency Breakdown</h2>
        <div className="text-center text-slate-400 py-8">
          No currency spent yet. Start collecting items to see your spending breakdown!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">💰 Currency Breakdown</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        {currencyData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Currency Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart */}
        {barData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Currency Amounts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* USD Spent */}
      {price > 0 && (
        <div className="mt-6 bg-slate-900/50 rounded-lg p-4 text-center">
          <div className="text-slate-400 mb-1">Total USD Spent on IAPs</div>
          <div className="text-3xl font-bold text-green-400">${price.toFixed(2)}</div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {currencyData.map((item) => (
          <div key={item.name} className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">{item.name}</div>
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
