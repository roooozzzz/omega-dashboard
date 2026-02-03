"use client";

import { Building2, TrendingUp, Zap } from "lucide-react";
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
    label: "Long",
    icon: Building2,
    color: "text-stripe-ink",
    bg: "bg-stripe-bg",
  },
  mid: {
    label: "Mid",
    icon: TrendingUp,
    color: "text-stripe-purple",
    bg: "bg-indigo-50",
  },
  short: {
    label: "Short",
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
          <StatusBadge variant="neutral">Moat: {position.moatScore}</StatusBadge>
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

// Demo data
export const demoPositions: Position[] = [
  {
    id: "1",
    ticker: "NVDA",
    name: "NVIDIA Corp",
    strategy: "long",
    shares: 150,
    avgCost: 485.32,
    currentPrice: 878.45,
    value: 131767,
    gain: 58969,
    gainPercent: 81.02,
    weight: 10.5,
    moatScore: 24,
  },
  {
    id: "2",
    ticker: "MSFT",
    name: "Microsoft Corp",
    strategy: "long",
    shares: 200,
    avgCost: 332.15,
    currentPrice: 412.35,
    value: 82470,
    gain: 16040,
    gainPercent: 24.16,
    weight: 6.6,
    moatScore: 26,
  },
  {
    id: "3",
    ticker: "AAPL",
    name: "Apple Inc",
    strategy: "long",
    shares: 300,
    avgCost: 165.42,
    currentPrice: 185.92,
    value: 55776,
    gain: 6150,
    gainPercent: 12.40,
    weight: 4.5,
    moatScore: 22,
  },
  {
    id: "4",
    ticker: "SMCI",
    name: "Super Micro Computer",
    strategy: "mid",
    shares: 80,
    avgCost: 756.45,
    currentPrice: 892.45,
    value: 71396,
    gain: 10880,
    gainPercent: 17.97,
    weight: 5.7,
    rsRating: 94,
  },
  {
    id: "5",
    ticker: "ARM",
    name: "Arm Holdings",
    strategy: "mid",
    shares: 200,
    avgCost: 142.30,
    currentPrice: 156.78,
    value: 31356,
    gain: 2896,
    gainPercent: 10.18,
    weight: 2.5,
    rsRating: 88,
  },
  {
    id: "6",
    ticker: "CRWD",
    name: "CrowdStrike",
    strategy: "long",
    shares: 100,
    avgCost: 245.67,
    currentPrice: 312.45,
    value: 31245,
    gain: 6678,
    gainPercent: 27.19,
    weight: 2.5,
    moatScore: 23,
  },
  {
    id: "7",
    ticker: "GOOGL",
    name: "Alphabet Inc",
    strategy: "short",
    shares: 400,
    avgCost: 138.45,
    currentPrice: 141.22,
    value: 56488,
    gain: 1108,
    gainPercent: 2.00,
    weight: 4.5,
    rsi: 24,
  },
  {
    id: "8",
    ticker: "PLTR",
    name: "Palantir Technologies",
    strategy: "mid",
    shares: 500,
    avgCost: 22.45,
    currentPrice: 24.67,
    value: 12335,
    gain: 1110,
    gainPercent: 9.89,
    weight: 1.0,
    rsRating: 82,
  },
];

export function PositionsTable() {
  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      {/* Header */}
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stripe-ink">Positions</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            {demoPositions.length} active positions across 3 strategies
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-stripe-border bg-stripe-bg">
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Stock
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Strategy
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Shares
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Avg Cost
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Price
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Value
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Gain/Loss
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Weight
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Indicator
            </th>
          </tr>
        </thead>
        <tbody>
          {demoPositions.map((position) => (
            <PositionRow key={position.id} position={position} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
