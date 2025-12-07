"use client";

interface Props {
  progress: {
    items: { total: number; unlocked: number; percentage: number };
    nodes: { total: number; unlocked: number; percentage: number };
    wingedLights: { total: number; unlocked: number; percentage: number };
    iaps: { total: number; bought: number; percentage: number };
  };
  currencies: {
    candles: number;
    hearts: number;
    ascendedCandles: number;
    giftPasses: number;
  };
}

export default function StatsOverview({ progress, currencies }: Props) {
  const stats = [
    {
      label: "Items",
      value: progress.items.unlocked,
      total: progress.items.total,
      percentage: progress.items.percentage,
      icon: "✨",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Spirit Nodes",
      value: progress.nodes.unlocked,
      total: progress.nodes.total,
      percentage: progress.nodes.percentage,
      icon: "🌟",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Winged Lights",
      value: progress.wingedLights.unlocked,
      total: progress.wingedLights.total,
      percentage: progress.wingedLights.percentage,
      icon: "🕯️",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "IAPs",
      value: progress.iaps.bought,
      total: progress.iaps.total,
      percentage: progress.iaps.percentage,
      icon: "💎",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const currencyStats = [
    { label: "Candles", value: currencies.candles, icon: "🕯️", color: "text-orange-400" },
    { label: "Hearts", value: currencies.hearts, icon: "❤️", color: "text-red-400" },
    { label: "Ascended Candles", value: currencies.ascendedCandles, icon: "🔺", color: "text-cyan-400" },
    { label: "Gift Passes", value: currencies.giftPasses, icon: "🎁", color: "text-purple-400" },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Progress Overview</h2>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.percentage}%
              </span>
            </div>
            <h3 className="text-slate-400 text-sm mb-2">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-slate-500">/ {stat.total}</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Current Currencies */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💰 Current Currencies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currencyStats.map((currency) => (
            <div key={currency.label} className="flex items-center gap-3">
              <span className="text-2xl">{currency.icon}</span>
              <div>
                <div className="text-sm text-slate-400">{currency.label}</div>
                <div className={`text-xl font-bold ${currency.color}`}>{currency.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
