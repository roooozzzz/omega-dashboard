"use client";

import { TrendingUp, TrendingDown, Eye, AlertCircle, Building2, Zap } from "lucide-react";
import { SignalStats } from "@/types/signals";

interface SignalsStatsProps {
  stats?: SignalStats;
  loading?: boolean;
}

// 默认统计数据
const defaultStats: SignalStats = {
  total: 127,
  today: 8,
  by_strategy: {
    long: 45,
    mid: 52,
    short: 30,
  },
  by_action: {
    BUY: 38,
    SELL: 12,
    HOLD: 52,
    WATCH: 25,
  },
  subscribers: 156,
};

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export function SignalsStats({ stats = defaultStats, loading }: SignalsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-stripe-border p-5 animate-pulse"
          >
            <div className="h-4 bg-stripe-bg rounded w-16 mb-2" />
            <div className="h-8 bg-stripe-bg rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      label: "总信号数",
      value: stats.total,
      change: stats.today > 0 ? `+${stats.today} 今日` : undefined,
      changeType: "positive",
      icon: <AlertCircle className="w-5 h-5 text-stripe-purple" />,
    },
    {
      label: "买入信号",
      value: stats.by_action.BUY || 0,
      icon: <TrendingUp className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "卖出信号",
      value: stats.by_action.SELL || 0,
      icon: <TrendingDown className="w-5 h-5 text-stripe-danger" />,
    },
    {
      label: "观望信号",
      value: (stats.by_action.HOLD || 0) + (stats.by_action.WATCH || 0),
      icon: <Eye className="w-5 h-5 text-stripe-warning" />,
    },
    {
      label: "长线策略",
      value: stats.by_strategy.long || 0,
      icon: <Building2 className="w-5 h-5 text-stripe-ink" />,
    },
    {
      label: "短线策略",
      value: stats.by_strategy.short || 0,
      icon: <Zap className="w-5 h-5 text-stripe-warning" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-stripe-border p-5 shadow-[var(--shadow-omega-sm)]"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stripe-ink-lighter">{stat.label}</p>
            {stat.icon}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stripe-ink">
              {stat.value}
            </span>
            {stat.change && (
              <span
                className={`text-sm ${
                  stat.changeType === "positive"
                    ? "text-stripe-success"
                    : stat.changeType === "negative"
                    ? "text-stripe-danger"
                    : "text-stripe-ink-lighter"
                }`}
              >
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
