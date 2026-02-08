"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";

export interface StatCardConfig {
  label: string;
  value: number | string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

interface StrategyStatsProps {
  cards: StatCardConfig[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  wsConnected?: boolean;
  onWsConnect?: () => void;
  onWsDisconnect?: () => void;
}

export function StrategyStats({
  cards,
  loading = false,
  error,
  onRefresh,
  wsConnected = false,
  onWsConnect,
  onWsDisconnect,
}: StrategyStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
          {(onWsConnect || onWsDisconnect) && (
            <button
              onClick={wsConnected ? onWsDisconnect : onWsConnect}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                wsConnected
                  ? "bg-stripe-success text-white"
                  : "bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border"
              }`}
            >
              {wsConnected ? (
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
          )}
          {/* 刷新按钮 */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((stat) => (
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
