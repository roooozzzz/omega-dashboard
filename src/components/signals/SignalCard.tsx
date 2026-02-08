"use client";

import { useState } from "react";
import { Building2, TrendingUp, Zap, PieChart, Clock, Target, ArrowUpRight, ArrowDownRight, Check, X, Loader2 } from "lucide-react";
import { TradingSignal, STRATEGY_CONFIG, ACTION_CONFIG, SIGNAL_TYPE_CONFIG, DECISION_CONFIG } from "@/types/signals";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { STRATEGY_GLOSSARY, SIGNAL_GLOSSARY, STATS_GLOSSARY, matchIndicatorGlossary } from "@/lib/glossary";
import { signalsApi } from "@/lib/api";

interface SignalCardProps {
  signal: TradingSignal;
  onClick?: () => void;
  onDecisionChange?: (signal: TradingSignal) => void;
}

const StrategyIcons: Record<string, typeof Building2> = {
  index: PieChart,
  long: Building2,
  mid: TrendingUp,
  short: Zap,
};

export function SignalCard({ signal, onClick, onDecisionChange }: SignalCardProps) {
  const [decision, setDecision] = useState(signal.user_decision || "pending");
  const [loading, setLoading] = useState(false);

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

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await signalsApi.confirm(signal.id);
      setDecision("confirmed");
      onDecisionChange?.({ ...signal, user_decision: "confirmed" });
    } catch (err) {
      console.error("确认信号失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await signalsApi.ignore(signal.id);
      setDecision("ignored");
      onDecisionChange?.({ ...signal, user_decision: "ignored" });
    } catch (err) {
      console.error("忽略信号失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const showDecisionButtons = signal.strategy !== "long" && decision === "pending";
  const decisionConfig = decision !== "pending" ? DECISION_CONFIG[decision] : null;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-stripe-ink rounded-lg border border-stripe-border dark:border-stripe-ink-light p-4
        shadow-[var(--shadow-omega-sm)] hover:shadow-[var(--shadow-omega-md)]
        transition-all cursor-pointer hover:border-stripe-purple/30
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stripe-bg dark:bg-stripe-ink-lighter/10 flex items-center justify-center">
            <span className="text-sm font-bold text-stripe-ink dark:text-white">
              {signal.ticker.slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-stripe-ink dark:text-white">{signal.ticker}</h3>
            {signal.name && (
              <p className="text-xs text-stripe-ink-lighter">{signal.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge variant={actionConfig.variant}>
            {actionConfig.label}
          </StatusBadge>
          <InfoTooltip entry={SIGNAL_GLOSSARY.signalColumn} />
        </div>
      </div>

      {/* Signal Type & Strategy */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${strategyConfig.bg}`}>
          <StrategyIcon className={`w-3.5 h-3.5 ${strategyConfig.color}`} />
          <span className={`text-xs font-medium ${strategyConfig.color}`}>
            {strategyConfig.label}
          </span>
        </div>
        {(() => {
          const stratGlossaryKey = signal.strategy === "index" ? "base" : signal.strategy === "long" ? "core" : signal.strategy === "mid" ? "flow" : "swing";
          const entry = STRATEGY_GLOSSARY[stratGlossaryKey];
          return entry ? <InfoTooltip entry={entry} /> : null;
        })()}
        <span className={`text-sm font-medium ${signalTypeConfig?.color || 'text-stripe-ink'}`}>
          {signalTypeConfig?.label || signal.signal_type}
        </span>
      </div>

      {/* Score & Price */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-stripe-ink-lighter" />
          <span className="text-sm text-stripe-ink dark:text-white flex items-center gap-0.5">
            评分 <span className="font-semibold">{signal.score}</span>
            <InfoTooltip entry={STATS_GLOSSARY.signalScore} />
          </span>
        </div>
        {signal.price && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-stripe-ink dark:text-white">
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
          {signal.reasons.slice(0, 2).map((reason, i) => {
            const reasonEntry = matchIndicatorGlossary(reason);
            return (
              <div key={i} className="flex items-center gap-0.5">
                <p className="truncate">• {reason}</p>
                {reasonEntry && <InfoTooltip entry={reasonEntry} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Buttons or Badge */}
      {signal.strategy !== "long" && (
        <div className="mb-3">
          {showDecisionButtons ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stripe-success-light text-[#0E6245] hover:bg-stripe-success/20 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                确认执行
              </button>
              <button
                onClick={handleIgnore}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                忽略
              </button>
            </div>
          ) : decisionConfig ? (
            <StatusBadge variant={decisionConfig.variant}>
              {decisionConfig.label}
            </StatusBadge>
          ) : null}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stripe-border-light">
        <div className="flex items-center gap-1 text-xs text-stripe-ink-lighter">
          <Clock className="w-3 h-3" />
          {formatTime(signal.timestamp)}
        </div>
        {signal.suggested_position > 0 && (
          <span className="text-xs text-stripe-purple font-medium flex items-center gap-0.5">
            建议仓位 {(signal.suggested_position * 100).toFixed(0)}%
            <InfoTooltip entry={STATS_GLOSSARY.suggestedPosition} />
          </span>
        )}
      </div>
    </div>
  );
}
