import { FileText, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function MoatStats() {
  const stats: StatCard[] = [
    {
      label: "Total Analyzed",
      value: 147,
      icon: <FileText className="w-4 h-4 text-stripe-purple" />,
      trend: "+12 this week",
      trendUp: true,
    },
    {
      label: "Verified Moats",
      value: 42,
      icon: <ShieldCheck className="w-4 h-4 text-stripe-success" />,
      trend: "28.5% rate",
    },
    {
      label: "Pending Review",
      value: 18,
      icon: <AlertTriangle className="w-4 h-4 text-stripe-warning" />,
      trend: "3 high priority",
    },
    {
      label: "Avg AI Score",
      value: "21.4",
      icon: <TrendingUp className="w-4 h-4 text-stripe-info" />,
      trend: "+2.1 vs last month",
      trendUp: true,
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
          {stat.trend && (
            <p
              className={`text-xs mt-1 ${
                stat.trendUp ? "text-stripe-success" : "text-stripe-ink-lighter"
              }`}
            >
              {stat.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
