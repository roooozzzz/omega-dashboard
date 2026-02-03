"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { LucideIcon } from "lucide-react";

type SignalType = "BUY" | "SELL" | "WATCH" | "ALERT";
type StrategyType = "long" | "mid" | "short";

interface Signal {
  id: string;
  ticker: string;
  name: string;
  type: SignalType;
  strategy: StrategyType;
  trigger: string;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  timestamp: string;
  status: "Active" | "Executed" | "Expired" | "Cancelled";
  notes?: string;
}

const signalTypeConfig: Record<
  SignalType,
  { icon: LucideIcon; color: string; bg: string }
> = {
  BUY: {
    icon: TrendingUp,
    color: "text-stripe-success",
    bg: "bg-stripe-success-light",
  },
  SELL: {
    icon: TrendingDown,
    color: "text-stripe-danger",
    bg: "bg-stripe-danger-light",
  },
  WATCH: {
    icon: Clock,
    color: "text-stripe-warning",
    bg: "bg-stripe-warning-light",
  },
  ALERT: {
    icon: AlertCircle,
    color: "text-stripe-info",
    bg: "bg-stripe-info-light",
  },
};

const strategyConfig: Record<
  StrategyType,
  { label: string; icon: LucideIcon; color: string }
> = {
  long: { label: "Long Term", icon: Building2, color: "text-stripe-ink" },
  mid: { label: "Mid Term", icon: TrendingUp, color: "text-stripe-purple" },
  short: { label: "Short Term", icon: Zap, color: "text-stripe-warning" },
};

const statusConfig = {
  Active: { variant: "success" as const, icon: CheckCircle },
  Executed: { variant: "info" as const, icon: CheckCircle },
  Expired: { variant: "neutral" as const, icon: Clock },
  Cancelled: { variant: "danger" as const, icon: AlertCircle },
};

interface SignalRowProps {
  signal: Signal;
}

function SignalRow({ signal }: SignalRowProps) {
  const typeConfig = signalTypeConfig[signal.type];
  const TypeIcon = typeConfig.icon;
  const stratConfig = strategyConfig[signal.strategy];
  const StratIcon = stratConfig.icon;

  return (
    <tr className="hover:bg-[#FAFBFC] transition-colors duration-150 border-b border-stripe-border">
      {/* Signal Type */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${typeConfig.bg} flex items-center justify-center`}
          >
            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
          </div>
          <span className={`font-semibold text-sm ${typeConfig.color}`}>
            {signal.type}
          </span>
        </div>
      </td>

      {/* Stock */}
      <td className="px-5 py-4">
        <p className="font-medium text-sm text-stripe-ink">{signal.ticker}</p>
        <p className="text-xs text-stripe-ink-lighter">{signal.name}</p>
      </td>

      {/* Strategy */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <StratIcon className={`w-4 h-4 ${stratConfig.color}`} />
          <span className="text-sm text-stripe-ink-light">
            {stratConfig.label}
          </span>
        </div>
      </td>

      {/* Trigger */}
      <td className="px-5 py-4">
        <p className="text-sm text-stripe-ink">{signal.trigger}</p>
      </td>

      {/* Price */}
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-stripe-ink">
          ${signal.price.toFixed(2)}
        </p>
        {signal.targetPrice && (
          <p className="text-xs text-stripe-success">
            Target: ${signal.targetPrice.toFixed(2)}
          </p>
        )}
      </td>

      {/* Time */}
      <td className="px-5 py-4">
        <p className="text-sm text-stripe-ink-lighter">{signal.timestamp}</p>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge variant={statusConfig[signal.status].variant}>
          {signal.status}
        </StatusBadge>
      </td>
    </tr>
  );
}

// Demo data
export const demoSignals: Signal[] = [
  {
    id: "1",
    ticker: "MSFT",
    name: "Microsoft Corp",
    type: "BUY",
    strategy: "long",
    trigger: "Moat Score > 25, ROE expansion",
    price: 412.35,
    targetPrice: 480.0,
    stopLoss: 380.0,
    timestamp: "Today 14:32",
    status: "Active",
  },
  {
    id: "2",
    ticker: "SMCI",
    name: "Super Micro Computer",
    type: "BUY",
    strategy: "mid",
    trigger: "Pocket Pivot on 2.3x volume",
    price: 892.45,
    targetPrice: 1050.0,
    timestamp: "Today 10:15",
    status: "Executed",
  },
  {
    id: "3",
    ticker: "GOOGL",
    name: "Alphabet Inc",
    type: "BUY",
    strategy: "short",
    trigger: "RSI(2) < 20, oversold bounce",
    price: 141.22,
    targetPrice: 148.0,
    timestamp: "Today 09:45",
    status: "Active",
  },
  {
    id: "4",
    ticker: "ARM",
    name: "Arm Holdings",
    type: "WATCH",
    strategy: "mid",
    trigger: "VCP forming, wait for breakout",
    price: 156.78,
    timestamp: "Yesterday 16:00",
    status: "Active",
  },
  {
    id: "5",
    ticker: "NVDA",
    name: "NVIDIA Corp",
    type: "ALERT",
    strategy: "long",
    trigger: "Approaching resistance at $900",
    price: 878.35,
    timestamp: "Yesterday 14:22",
    status: "Active",
  },
  {
    id: "6",
    ticker: "TSLA",
    name: "Tesla Inc",
    type: "SELL",
    strategy: "short",
    trigger: "RSI(2) > 95, overbought",
    price: 245.67,
    timestamp: "Feb 1, 11:30",
    status: "Executed",
  },
  {
    id: "7",
    ticker: "META",
    name: "Meta Platforms",
    type: "WATCH",
    strategy: "short",
    trigger: "RSI approaching oversold",
    price: 485.32,
    timestamp: "Feb 1, 09:15",
    status: "Expired",
  },
];

export function SignalsTable() {
  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stripe-border bg-stripe-bg">
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Signal
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Stock
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Strategy
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Trigger
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Price
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Time
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {demoSignals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
