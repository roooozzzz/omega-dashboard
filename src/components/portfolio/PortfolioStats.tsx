import {
  DollarSign,
  TrendingUp,
  PieChart,
  Target,
} from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeUp?: boolean;
}

export function PortfolioStats() {
  const stats: StatCard[] = [
    {
      label: "Total Value",
      value: "$1,247,832",
      icon: <DollarSign className="w-4 h-4 text-stripe-purple" />,
      change: "+$23,450 today",
      changeUp: true,
    },
    {
      label: "Total Return",
      value: "+24.78%",
      icon: <TrendingUp className="w-4 h-4 text-stripe-success" />,
      change: "vs SPX +18.2%",
      changeUp: true,
    },
    {
      label: "Positions",
      value: "12",
      icon: <PieChart className="w-4 h-4 text-stripe-info" />,
      change: "Long: 8 · Mid: 3 · Short: 1",
    },
    {
      label: "Cash Available",
      value: "$147,832",
      icon: <Target className="w-4 h-4 text-stripe-ink-light" />,
      change: "11.8% of portfolio",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-stripe-border p-4 shadow-[var(--shadow-omega-sm)]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stripe-ink-lighter">{stat.label}</span>
            {stat.icon}
          </div>
          <p className="text-2xl font-semibold text-stripe-ink">{stat.value}</p>
          {stat.change && (
            <p
              className={`text-xs mt-1 ${
                stat.changeUp ? "text-stripe-success" : "text-stripe-ink-lighter"
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
