import { Building2, TrendingUp, Zap } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { LucideIcon } from "lucide-react";

interface StockItem {
  ticker: string;
  badge: { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" };
  signal: string;
  signalHighlight?: boolean;
}

interface StrategyPanelProps {
  type: "long" | "mid" | "short";
}

const strategyConfig: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    stocks: StockItem[];
  }
> = {
  long: {
    title: "Long Term",
    subtitle: "50% · Quality Filter",
    icon: Building2,
    stocks: [
      {
        ticker: "NVDA",
        badge: { label: "Moat: 24", variant: "neutral" },
        signal: "HOLD",
      },
      {
        ticker: "AAPL",
        badge: { label: "Moat: 22", variant: "neutral" },
        signal: "HOLD",
      },
      {
        ticker: "MSFT",
        badge: { label: "Moat: 26", variant: "neutral" },
        signal: "BUY",
        signalHighlight: true,
      },
    ],
  },
  mid: {
    title: "Mid Term",
    subtitle: "30% · Momentum Filter",
    icon: TrendingUp,
    stocks: [
      {
        ticker: "SMCI",
        badge: { label: "RS: 94", variant: "neutral" },
        signal: "Pocket Pivot",
        signalHighlight: true,
      },
      {
        ticker: "ARM",
        badge: { label: "RS: 88", variant: "neutral" },
        signal: "VCP Forming",
      },
      {
        ticker: "PLTR",
        badge: { label: "RS: 82", variant: "neutral" },
        signal: "Watching",
      },
    ],
  },
  short: {
    title: "Short Term",
    subtitle: "20% · Sentiment Filter",
    icon: Zap,
    stocks: [
      {
        ticker: "GOOGL",
        badge: { label: "RSI: 18", variant: "danger" },
        signal: "Oversold · T1",
        signalHighlight: true,
      },
      {
        ticker: "META",
        badge: { label: "RSI: 32", variant: "warning" },
        signal: "Watching",
      },
      {
        ticker: "AMZN",
        badge: { label: "RSI: 55", variant: "success" },
        signal: "Normal",
      },
    ],
  },
};

export function StrategyPanel({ type }: StrategyPanelProps) {
  const config = strategyConfig[type];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)] hover:shadow-[var(--shadow-omega)] transition-shadow duration-150">
      {/* Header */}
      <div className="p-5 border-b border-stripe-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-stripe-bg flex items-center justify-center">
              <Icon className="w-[18px] h-[18px] text-stripe-ink" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-stripe-ink">
                {config.title}
              </h3>
              <p className="text-xs text-stripe-ink-lighter">{config.subtitle}</p>
            </div>
          </div>
          <StatusBadge variant="success">Active</StatusBadge>
        </div>
      </div>

      {/* Stock List */}
      <div className="p-5 space-y-3">
        {config.stocks.map((stock, i) => (
          <div
            key={stock.ticker}
            className={`flex items-center justify-between py-2 ${
              i < config.stocks.length - 1
                ? "border-b border-stripe-border-light"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm">{stock.ticker}</span>
              <StatusBadge variant={stock.badge.variant}>
                {stock.badge.label}
              </StatusBadge>
            </div>
            <span
              className={`text-sm ${
                stock.signalHighlight
                  ? "font-medium text-stripe-purple"
                  : "text-stripe-ink-lighter"
              }`}
            >
              {stock.signal}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
