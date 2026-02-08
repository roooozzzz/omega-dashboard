"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, TrendingUp, Zap, Loader2, Check, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSignals, TradingSignal } from "@/hooks/useSignals";
import { signalsApi } from "@/lib/api";
import type { LucideIcon } from "lucide-react";

type SignalTypeDisplay = "买入" | "卖出" | "观望" | "预警";
type StrategyType = "long" | "mid" | "short";

const signalConfig: Record<SignalTypeDisplay, { variant: "success" | "danger" | "neutral" | "warning" }> = {
  "买入": { variant: "success" },
  "卖出": { variant: "danger" },
  "观望": { variant: "neutral" },
  "预警": { variant: "warning" },
};

const strategyConfig: Record<
  StrategyType,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  long: {
    label: "长线",
    icon: Building2,
    color: "text-stripe-ink",
    bg: "bg-stripe-bg",
  },
  mid: {
    label: "中线",
    icon: TrendingUp,
    color: "text-stripe-purple",
    bg: "bg-indigo-50",
  },
  short: {
    label: "短线",
    icon: Zap,
    color: "text-stripe-warning",
    bg: "bg-stripe-warning-light",
  },
};

// 将 API 信号类型转换为显示类型
function getSignalDisplay(signal: TradingSignal): SignalTypeDisplay {
  switch (signal.type) {
    case "buy":
      return "买入";
    case "sell":
      return "卖出";
    case "watch":
      return "观望";
    case "alert":
      return "预警";
    default:
      return "观望";
  }
}

// 格式化时间
function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

interface SignalsTableProps {
  strategy?: "long" | "mid" | "short";
  ticker?: string;
  action?: string;
  limit?: number;
}

function DecisionCell({ signal, onUpdate }: { signal: TradingSignal; onUpdate: () => void }) {
  const [decision, setDecision] = useState(
    signal.userDecision || "pending"
  );
  const [loading, setLoading] = useState(false);

  if (decision === "confirmed") {
    return <StatusBadge variant="success">已确认</StatusBadge>;
  }
  if (decision === "ignored") {
    return <StatusBadge variant="neutral">已忽略</StatusBadge>;
  }

  const handleAction = async (action: "confirm" | "ignore") => {
    setLoading(true);
    try {
      if (action === "confirm") {
        await signalsApi.confirm(signal.id);
        setDecision("confirmed");
      } else {
        await signalsApi.ignore(signal.id);
        setDecision("ignored");
      }
      onUpdate();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleAction("confirm")}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-stripe-success-light text-[#0E6245] hover:bg-stripe-success/20 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        确认
      </button>
      <button
        onClick={() => handleAction("ignore")}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        忽略
      </button>
    </div>
  );
}

export function SignalsTable({ strategy, ticker, action, limit = 50 }: SignalsTableProps) {
  const { signals, loading, error, refresh } = useSignals({
    strategy,
    ticker,
    action,
    limit,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
        <div className="p-5 border-b border-stripe-border">
          <h2 className="font-semibold text-stripe-ink">信号历史</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            加载中...
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-stripe-purple" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
        <div className="p-5 border-b border-stripe-border">
          <h2 className="font-semibold text-stripe-ink">信号历史</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-stripe-danger mb-2">{error}</p>
          <p className="text-sm text-stripe-ink-lighter">
            请确保后端服务运行在 localhost:8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      <div className="p-5 border-b border-stripe-border">
        <h2 className="font-semibold text-stripe-ink">信号历史</h2>
        <p className="text-sm text-stripe-ink-lighter mt-0.5">
          {signals.length > 0
            ? `共 ${signals.length} 条信号记录`
            : "暂无信号数据"}
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-stripe-ink-lighter">暂无信号</p>
          <p className="text-sm text-stripe-ink-lighter mt-1">
            当检测到交易机会时，信号将显示在此处
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-stripe-border">
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                股票
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                信号
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                策略
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                指标
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                价格
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                触发时间
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                原因
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                决策
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => {
              const StratIcon = strategyConfig[signal.strategy]?.icon || Building2;
              const signalDisplay = getSignalDisplay(signal);
              
              return (
                <TableRow
                  key={signal.id}
                  className="hover:bg-stripe-bg border-b border-stripe-border-light"
                >
                  <TableCell>
                    <Link
                      href={`/stock/${encodeURIComponent(signal.ticker)}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-stripe-bg flex items-center justify-center">
                        <span className="text-sm font-medium text-stripe-ink">
                          {signal.ticker[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-stripe-ink group-hover:text-stripe-purple transition-colors">
                          {signal.ticker}
                        </p>
                        <p className="text-xs text-stripe-ink-lighter">
                          {signal.name || signal.ticker}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={signalConfig[signalDisplay].variant}>
                      {signalDisplay}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
                        strategyConfig[signal.strategy]?.bg || "bg-stripe-bg"
                      }`}
                    >
                      <StratIcon
                        className={`w-3.5 h-3.5 ${
                          strategyConfig[signal.strategy]?.color || "text-stripe-ink"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          strategyConfig[signal.strategy]?.color || "text-stripe-ink"
                        }`}
                      >
                        {strategyConfig[signal.strategy]?.label || signal.strategy}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-stripe-ink">
                      {signal.indicator}: {signal.indicatorValue}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-stripe-ink">
                        ${signal.price?.toFixed(2) || "-"}
                      </p>
                      {signal.targetPrice && (
                        <p className="text-xs text-stripe-ink-lighter">
                          目标: ${signal.targetPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-stripe-ink-lighter">
                      {formatTime(signal.triggeredAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-stripe-ink-lighter max-w-xs truncate">
                      {signal.reason}
                    </p>
                  </TableCell>
                  <TableCell>
                    <DecisionCell signal={signal} onUpdate={refresh} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
