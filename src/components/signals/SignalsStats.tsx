"use client";

import { TrendingUp, TrendingDown, Eye, AlertCircle, Building2, Zap, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSignals, useSignalStream, SignalStats } from "@/hooks/useSignals";

interface SignalsStatsProps {
  onSignalReceived?: () => void;
}

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export function SignalsStats({ onSignalReceived }: SignalsStatsProps) {
  const { stats, loading, error, refresh } = useSignals({ autoRefresh: true, refreshInterval: 30000 });
  const { connected, connect, disconnect } = useSignalStream({
    onSignal: () => {
      onSignalReceived?.();
      refresh();
    },
  });

  // 默认统计数据（API 失败时使用）
  const defaultStats: SignalStats = {
    total: 0,
    active: 0,
    byStrategy: { index: 0, long: 0, mid: 0, short: 0 },
    byType: { buy: 0, sell: 0, watch: 0, alert: 0 },
  };

  const currentStats = stats || defaultStats;

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
      value: currentStats.total,
      change: currentStats.active > 0 ? `${currentStats.active} 活跃` : undefined,
      changeType: "positive",
      icon: <AlertCircle className="w-5 h-5 text-stripe-purple" />,
    },
    {
      label: "买入信号",
      value: currentStats.byType.buy || 0,
      icon: <TrendingUp className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "卖出信号",
      value: currentStats.byType.sell || 0,
      icon: <TrendingDown className="w-5 h-5 text-stripe-danger" />,
    },
    {
      label: "观望信号",
      value: (currentStats.byType.watch || 0) + (currentStats.byType.alert || 0),
      icon: <Eye className="w-5 h-5 text-stripe-warning" />,
    },
    {
      label: "长线策略",
      value: currentStats.byStrategy.long || 0,
      icon: <Building2 className="w-5 h-5 text-stripe-ink" />,
    },
    {
      label: "短线策略",
      value: currentStats.byStrategy.short || 0,
      icon: <Zap className="w-5 h-5 text-stripe-warning" />,
    },
  ];

  return (
    <div className="mb-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-stripe-danger">{error}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 实时连接按钮 */}
          <button
            onClick={connected ? disconnect : connect}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              connected
                ? "bg-stripe-success text-white"
                : "bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border"
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-4 h-4" />
                实时连接
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                离线
              </>
            )}
          </button>
          {/* 刷新按钮 */}
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
    </div>
  );
}
