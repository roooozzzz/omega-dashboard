"use client";

import { useState } from "react";
import { Building2, TrendingUp, Zap, Clock, Check, X, Filter } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useSignals } from "@/hooks/useSignals";
import type { LucideIcon } from "lucide-react";

type DecisionFilter = "all" | "confirmed" | "ignored";

const strategyConfig: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  long: { label: "长线", icon: Building2, color: "text-stripe-ink", bg: "bg-stripe-bg" },
  mid: { label: "中线", icon: TrendingUp, color: "text-stripe-purple", bg: "bg-indigo-50" },
  short: { label: "短线", icon: Zap, color: "text-stripe-warning", bg: "bg-stripe-warning-light" },
};

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

export function DecisionHistory() {
  const [filter, setFilter] = useState<DecisionFilter>("all");
  const { signals, loading } = useSignals({ limit: 100, autoRefresh: true, refreshInterval: 15000 });

  // 只显示非 long 策略、且已做过决策的信号
  const decidedSignals = signals.filter((s) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sig = s as any;
    const decision = sig.user_decision ?? sig.userDecision ?? "pending";
    if (s.strategy === "long") return false;
    if (decision === "pending") return false;
    if (filter === "all") return true;
    return decision === filter;
  });

  const filterOptions: { value: DecisionFilter; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "confirmed", label: "已确认" },
    { value: "ignored", label: "已忽略" },
  ];

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stripe-ink">我的决策记录</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            {decidedSignals.length > 0
              ? `共 ${decidedSignals.length} 条决策记录`
              : "暂无决策记录"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-stripe-ink-lighter mr-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-stripe-purple text-white"
                  : "bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-6 h-6 border-2 border-stripe-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : decidedSignals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-stripe-ink-lighter">暂无决策记录</p>
          <p className="text-sm text-stripe-ink-lighter mt-1">
            对中线和短线信号做出确认或忽略后，记录将显示在此处
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stripe-border-light">
          {decidedSignals.map((signal) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sig = signal as any;
            const decision = sig.user_decision ?? sig.userDecision ?? "pending";
            const decisionTime = sig.user_decision_at ?? sig.userDecisionAt;
            const notes = sig.user_notes ?? sig.userNotes;
            const config = strategyConfig[signal.strategy];
            const StratIcon = config?.icon || Building2;

            return (
              <div
                key={signal.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-stripe-bg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-stripe-bg flex items-center justify-center">
                    <span className="text-sm font-bold text-stripe-ink">
                      {signal.ticker.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-stripe-ink">
                        {signal.ticker}
                      </span>
                      {signal.name && (
                        <span className="text-xs text-stripe-ink-lighter">{signal.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${config?.bg || "bg-stripe-bg"}`}>
                        <StratIcon className={`w-3 h-3 ${config?.color || "text-stripe-ink"}`} />
                        <span className={`text-xs ${config?.color || "text-stripe-ink"}`}>
                          {config?.label || signal.strategy}
                        </span>
                      </div>
                      {signal.price && (
                        <span className="text-xs text-stripe-ink-lighter">
                          ${signal.price.toFixed(2)}
                        </span>
                      )}
                      {notes && (
                        <span className="text-xs text-stripe-ink-lighter italic">
                          &quot;{notes}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge variant={decision === "confirmed" ? "success" : "neutral"}>
                    {decision === "confirmed" ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        已确认
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <X className="w-3 h-3" />
                        已忽略
                      </span>
                    )}
                  </StatusBadge>
                  {decisionTime && (
                    <span className="text-xs text-stripe-ink-lighter flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(decisionTime)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
