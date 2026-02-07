"use client";

import { Building2, TrendingUp, Zap, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { LucideIcon } from "lucide-react";

type StrategyType = "long" | "mid" | "short";

interface Position {
  id: string;
  ticker: string;
  name: string;
  strategy: StrategyType;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
  weight: number;
  moatScore?: number;
  rsRating?: number;
  rsi?: number;
}

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

function PositionRow({ position }: { position: Position }) {
  const stratConfig = strategyConfig[position.strategy];
  const StratIcon = stratConfig.icon;
  const isProfit = position.gain >= 0;

  return (
    <tr className="hover:bg-[#FAFBFC] transition-colors duration-150 border-b border-stripe-border">
      {/* Stock */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stripe-bg flex items-center justify-center">
            <span className="text-sm font-semibold text-stripe-ink">
              {position.ticker[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-stripe-ink">
              {position.ticker}
            </p>
            <p className="text-xs text-stripe-ink-lighter">{position.name}</p>
          </div>
        </div>
      </td>

      {/* Strategy */}
      <td className="px-5 py-4">
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${stratConfig.bg}`}
        >
          <StratIcon className={`w-3.5 h-3.5 ${stratConfig.color}`} />
          <span className={`text-xs font-medium ${stratConfig.color}`}>
            {stratConfig.label}
          </span>
        </div>
      </td>

      {/* Shares */}
      <td className="px-5 py-4">
        <p className="text-sm text-stripe-ink">{position.shares}</p>
      </td>

      {/* Avg Cost */}
      <td className="px-5 py-4">
        <p className="text-sm text-stripe-ink">
          ${position.avgCost.toFixed(2)}
        </p>
      </td>

      {/* Current Price */}
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-stripe-ink">
          ${position.currentPrice.toFixed(2)}
        </p>
      </td>

      {/* Value */}
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-stripe-ink">
          ${position.value.toLocaleString()}
        </p>
      </td>

      {/* Gain */}
      <td className="px-5 py-4">
        <p
          className={`text-sm font-medium ${
            isProfit ? "text-stripe-success" : "text-stripe-danger"
          }`}
        >
          {isProfit ? "+" : ""}${position.gain.toLocaleString()}
        </p>
        <p
          className={`text-xs ${
            isProfit ? "text-stripe-success" : "text-stripe-danger"
          }`}
        >
          {isProfit ? "+" : ""}
          {position.gainPercent.toFixed(2)}%
        </p>
      </td>

      {/* Weight */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-stripe-border rounded-full overflow-hidden">
            <div
              className="h-full bg-stripe-purple rounded-full"
              style={{ width: `${position.weight}%` }}
            />
          </div>
          <span className="text-xs text-stripe-ink-lighter">
            {position.weight.toFixed(1)}%
          </span>
        </div>
      </td>

      {/* Signal Indicator */}
      <td className="px-5 py-4">
        {position.strategy === "long" && position.moatScore && (
          <StatusBadge variant="neutral">护城河: {position.moatScore}</StatusBadge>
        )}
        {position.strategy === "mid" && position.rsRating && (
          <StatusBadge variant="neutral">RS: {position.rsRating}</StatusBadge>
        )}
        {position.strategy === "short" && position.rsi && (
          <StatusBadge
            variant={
              position.rsi < 30
                ? "danger"
                : position.rsi > 70
                ? "success"
                : "neutral"
            }
          >
            RSI: {position.rsi}
          </StatusBadge>
        )}
      </td>
    </tr>
  );
}

const positions: Position[] = [];

export function PositionsTable() {
  if (positions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
        <div className="p-5 border-b border-stripe-border">
          <h2 className="font-semibold text-stripe-ink">持仓明细</h2>
        </div>
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Inbox className="w-12 h-12 text-stripe-ink-lighter mb-4" />
          <p className="text-sm font-medium text-stripe-ink">暂无持仓</p>
          <p className="text-xs text-stripe-ink-lighter mt-1">
            连接券商账户后，持仓数据将自动同步
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      {/* Header */}
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stripe-ink">持仓明细</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            {positions.length} 个持仓，覆盖 3 层策略
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-stripe-border bg-stripe-bg">
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              股票
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              策略
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              股数
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              成本价
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              现价
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              市值
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              盈亏
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              仓位
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              指标
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <PositionRow key={position.id} position={position} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
