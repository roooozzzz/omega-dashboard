"use client";

import { Building2, TrendingUp, Zap, Clock, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { TradingSignal, STRATEGY_CONFIG, ACTION_CONFIG, SIGNAL_TYPE_CONFIG } from "@/types/signals";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface SignalCardProps {
  signal: TradingSignal;
  onClick?: () => void;
}

const StrategyIcons = {
  long: Building2,
  mid: TrendingUp,
  short: Zap,
};

export function SignalCard({ signal, onClick }: SignalCardProps) {
  const strategyConfig = STRATEGY_CONFIG[signal.strategy];
  const actionConfig = ACTION_CONFIG[signal.action];
  const signalTypeConfig = SIGNAL_TYPE_CONFIG[signal.signal_type];
  const StrategyIcon = StrategyIcons[signal.strategy];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-stripe-border p-4
        shadow-[var(--shadow-omega-sm)] hover:shadow-[var(--shadow-omega-md)]
        transition-all cursor-pointer hover:border-stripe-purple/30
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stripe-bg flex items-center justify-center">
            <span className="text-sm font-bold text-stripe-ink">
              {signal.ticker.slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-stripe-ink">{signal.ticker}</h3>
            {signal.name && (
              <p className="text-xs text-stripe-ink-lighter">{signal.name}</p>
            )}
          </div>
        </div>
        <StatusBadge variant={actionConfig.variant}>
          {actionConfig.label}
        </StatusBadge>
      </div>

      {/* Signal Type & Strategy */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${strategyConfig.bg}`}>
          <StrategyIcon className={`w-3.5 h-3.5 ${strategyConfig.color}`} />
          <span className={`text-xs font-medium ${strategyConfig.color}`}>
            {strategyConfig.label}
          </span>
        </div>
        <span className={`text-sm font-medium ${signalTypeConfig?.color || 'text-stripe-ink'}`}>
          {signalTypeConfig?.label || signal.signal_type}
        </span>
      </div>

      {/* Score & Price */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-stripe-ink-lighter" />
          <span className="text-sm text-stripe-ink">
            评分 <span className="font-semibold">{signal.score}</span>
          </span>
        </div>
        {signal.price && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-stripe-ink">
              ${signal.price.toFixed(2)}
            </span>
            {signal.change_percent !== undefined && (
              <span className={`text-xs flex items-center ${
                signal.change_percent >= 0 ? "text-stripe-success" : "text-stripe-danger"
              }`}>
                {signal.change_percent >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(signal.change_percent).toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reasons */}
      {signal.reasons.length > 0 && (
        <div className="text-xs text-stripe-ink-lighter mb-3">
          {signal.reasons.slice(0, 2).map((reason, i) => (
            <p key={i} className="truncate">• {reason}</p>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stripe-border-light">
        <div className="flex items-center gap-1 text-xs text-stripe-ink-lighter">
          <Clock className="w-3 h-3" />
          {formatTime(signal.timestamp)}
        </div>
        {signal.suggested_position > 0 && (
          <span className="text-xs text-stripe-purple font-medium">
            建议仓位 {(signal.suggested_position * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
