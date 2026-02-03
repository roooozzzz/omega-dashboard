import { TrendingUp, Activity, Shield, Bell } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface MarketCard {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  subtitleColor?: string;
}

const marketData: MarketCard[] = [
  {
    label: "S&P 500",
    value: "5,234.18",
    subtitle: "+1.24% above MA200",
    icon: <TrendingUp className="w-4 h-4 text-stripe-success" />,
    subtitleColor: "text-stripe-success",
  },
  {
    label: "VIX Index",
    value: "16.8",
    subtitle: "Normal range (<25)",
    icon: <Activity className="w-4 h-4 text-stripe-ink-lighter" />,
    subtitleColor: "text-stripe-ink-lighter",
  },
  {
    label: "Circuit Breaker",
    value: "",
    subtitle: "All strategies active",
    icon: <Shield className="w-4 h-4 text-stripe-success" />,
    subtitleColor: "text-stripe-ink-lighter",
  },
  {
    label: "Today's Signals",
    value: "3",
    subtitle: "Long: 1 · Mid: 1 · Short: 1",
    icon: <Bell className="w-4 h-4 text-stripe-purple" />,
    subtitleColor: "text-stripe-ink-lighter",
  },
];

export function MarketStatusBar() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {marketData.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-stripe-border p-5 shadow-[var(--shadow-omega-sm)] hover:shadow-[var(--shadow-omega)] transition-shadow duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-stripe-ink-lighter">{card.label}</span>
            {card.icon}
          </div>
          {card.label === "Circuit Breaker" ? (
            <StatusBadge variant="success">OFF</StatusBadge>
          ) : (
            <p className="text-2xl font-semibold text-stripe-ink">{card.value}</p>
          )}
          <p className={`text-sm mt-1 ${card.subtitleColor}`}>{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
