import { TrendingUp, TrendingDown, Bell, CheckCircle } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
}

export function SignalsStats() {
  const stats: StatCard[] = [
    {
      label: "Active Signals",
      value: 12,
      icon: <Bell className="w-4 h-4 text-stripe-purple" />,
      subtext: "4 high priority",
    },
    {
      label: "Buy Signals",
      value: 7,
      icon: <TrendingUp className="w-4 h-4 text-stripe-success" />,
      subtext: "3 today",
    },
    {
      label: "Sell Signals",
      value: 2,
      icon: <TrendingDown className="w-4 h-4 text-stripe-danger" />,
      subtext: "1 today",
    },
    {
      label: "Win Rate (30d)",
      value: "67%",
      icon: <CheckCircle className="w-4 h-4 text-stripe-success" />,
      subtext: "18/27 executed",
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
          {stat.subtext && (
            <p className="text-xs text-stripe-ink-lighter mt-1">{stat.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}
