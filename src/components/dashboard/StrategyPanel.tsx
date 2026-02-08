"use client";

import Link from "next/link";
import { Building2, TrendingUp, Zap, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useLongTermSignals,
  useMidTermSignals,
  useShortTermSignals,
} from "@/hooks/useSignals";

interface Stock {
  ticker: string;
  name: string;
  signal: string;
  signalType: "success" | "warning" | "danger" | "neutral";
  indicator: string;
}

interface Strategy {
  id: string;
  name: string;
  subtitle: string;
  allocation: number;
  icon: React.ReactNode;
  color: string;
  stocks: Stock[];
  loading: boolean;
  href: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function signalToStock(signal: any): Stock {
  const actionMap: Record<string, { label: string; type: "success" | "warning" | "danger" | "neutral" }> = {
    buy: { label: "买入", type: "success" },
    sell: { label: "卖出", type: "danger" },
    hold: { label: "持有", type: "neutral" },
    watch: { label: "观望", type: "warning" },
  };

  const action = actionMap[signal.type] || { label: signal.type || "买入", type: "neutral" as const };

  return {
    ticker: signal.ticker,
    name: signal.name || signal.ticker,
    signal: action.label,
    signalType: action.type,
    indicator: signal.indicator
      ? `${signal.indicator} ${signal.indicatorValue ?? ""}`
      : signal.signalType || "",
  };
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      {/* Header */}
      <div className="p-5 border-b border-stripe-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${strategy.color} flex items-center justify-center text-white`}
            >
              {strategy.icon}
            </div>
            <div>
              <h3 className="font-semibold text-stripe-ink">{strategy.name}</h3>
              <p className="text-xs text-stripe-ink-lighter">
                {strategy.subtitle}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold text-stripe-ink">
              {strategy.allocation}%
            </span>
            <p className="text-xs text-stripe-ink-lighter">目标仓位</p>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="divide-y divide-stripe-border-light">
        {strategy.loading ? (
          <div className="px-5 py-6 text-center text-sm text-stripe-ink-lighter">
            扫描中...
          </div>
        ) : strategy.stocks.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-stripe-ink-lighter">
            暂无信号
          </div>
        ) : (
          strategy.stocks.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="px-5 py-3 flex items-center justify-between hover:bg-stripe-bg transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stripe-bg flex items-center justify-center group-hover:bg-stripe-border transition-colors">
                  <span className="text-sm font-medium text-stripe-ink">
                    {stock.ticker[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-stripe-ink">
                      {stock.ticker}
                    </p>
                    <ExternalLink className="w-3 h-3 text-stripe-ink-lighter opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-stripe-ink-lighter">{stock.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stripe-ink-lighter">
                  {stock.indicator}
                </span>
                <StatusBadge variant={stock.signalType}>{stock.signal}</StatusBadge>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stripe-border">
        <Link href={strategy.href}>
          <Button
            variant="ghost"
            className="w-full justify-center text-stripe-purple hover:bg-stripe-bg"
          >
            查看更多
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function StrategyPanel() {
  const { signals: longSignals, loading: longLoading } = useLongTermSignals({ limit: 4 });
  const { signals: midSignals, loading: midLoading } = useMidTermSignals({ limit: 4 });
  const { signals: shortSignals, loading: shortLoading } = useShortTermSignals({ limit: 4 });

  const strategies: Strategy[] = [
    {
      id: "core",
      name: "长线 \u00B7 THE CORE",
      subtitle: "选「质」\u2014 护城河筛选",
      allocation: 50,
      icon: <Building2 className="w-5 h-5" />,
      color: "bg-stripe-ink",
      stocks: longSignals.map(signalToStock),
      loading: longLoading,
      href: "/signals/long",
    },
    {
      id: "flow",
      name: "中线 \u00B7 THE FLOW",
      subtitle: "借「势」\u2014 动量跟踪",
      allocation: 30,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-stripe-purple",
      stocks: midSignals.map(signalToStock),
      loading: midLoading,
      href: "/signals/mid",
    },
    {
      id: "swing",
      name: "短线 \u00B7 THE SWING",
      subtitle: "找「位」\u2014 情绪捕捉",
      allocation: 20,
      icon: <Zap className="w-5 h-5" />,
      color: "bg-stripe-warning",
      stocks: shortSignals.map(signalToStock),
      loading: shortLoading,
      href: "/signals/short",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      {strategies.map((strategy) => (
        <StrategyCard key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}
