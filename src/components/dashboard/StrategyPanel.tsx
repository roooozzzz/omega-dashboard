"use client";

import Link from "next/link";
import { Building2, TrendingUp, Zap, PieChart, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { STRATEGY_GLOSSARY } from "@/lib/glossary";
import {
  useLongTermSignals,
  useMidTermSignals,
  useShortTermSignals,
  useIndexSignals,
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
  glossaryKey: string;
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
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-stripe-ink">{strategy.name}</h3>
                {STRATEGY_GLOSSARY[strategy.glossaryKey] && (
                  <InfoTooltip entry={STRATEGY_GLOSSARY[strategy.glossaryKey]} />
                )}
              </div>
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
  const { signals: indexSignals, loading: indexLoading } = useIndexSignals({ limit: 4 });
  const { signals: longSignals, loading: longLoading } = useLongTermSignals({ limit: 4 });
  const { signals: midSignals, loading: midLoading } = useMidTermSignals({ limit: 4 });
  const { signals: shortSignals, loading: shortLoading } = useShortTermSignals({ limit: 4 });

  const strategies: Strategy[] = [
    {
      id: "base",
      name: "指数 · THE BASE",
      subtitle: "建「底」— 指数定投",
      allocation: 35,
      icon: <PieChart className="w-5 h-5" />,
      color: "bg-blue-600",
      stocks: indexSignals.map(signalToStock),
      loading: indexLoading,
      href: "/signals/index",
      glossaryKey: "base",
    },
    {
      id: "core",
      name: "长线 · THE CORE",
      subtitle: "选「质」— 护城河筛选",
      allocation: 30,
      icon: <Building2 className="w-5 h-5" />,
      color: "bg-stripe-ink",
      stocks: longSignals.map(signalToStock),
      loading: longLoading,
      href: "/signals/long",
      glossaryKey: "core",
    },
    {
      id: "flow",
      name: "中线 · THE FLOW",
      subtitle: "借「势」— 动量跟踪",
      allocation: 20,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-stripe-purple",
      stocks: midSignals.map(signalToStock),
      loading: midLoading,
      href: "/signals/mid",
      glossaryKey: "flow",
    },
    {
      id: "swing",
      name: "短线 · THE SWING",
      subtitle: "找「位」— 情绪捕捉",
      allocation: 15,
      icon: <Zap className="w-5 h-5" />,
      color: "bg-stripe-warning",
      stocks: shortSignals.map(signalToStock),
      loading: shortLoading,
      href: "/signals/short",
      glossaryKey: "swing",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {strategies.map((strategy) => (
        <StrategyCard key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}
