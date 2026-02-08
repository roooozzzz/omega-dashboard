"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Zap,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  Cpu,
  Scale,
  Cog,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSignals, TradingSignal } from "@/hooks/useSignals";
import { signalsApi, MoatData } from "@/lib/api";
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

const powersIcons: Record<string, LucideIcon> = {
  scaleEconomies: Scale,
  networkEffects: Users,
  counterPositioning: Zap,
  switchingCosts: Building2,
  branding: Shield,
  corneredResource: Cpu,
  processPower: Cog,
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
  moatMap?: Record<string, MoatData>;
  onMoatApprove?: (ticker: string, adjustedScores?: Record<string, number>) => void;
  onMoatReject?: (ticker: string) => void;
  moatLoading?: boolean;
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
        onClick={(e) => { e.stopPropagation(); handleAction("confirm"); }}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-stripe-success-light text-[#0E6245] hover:bg-stripe-success/20 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        确认
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleAction("ignore"); }}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        忽略
      </button>
    </div>
  );
}

// 护城河详情展开行（长线策略专用）
function MoatExpandedRow({
  moat,
  onApprove,
  onReject,
  loading,
}: {
  moat: MoatData;
  onApprove?: (ticker: string, adjustedScores?: Record<string, number>) => void;
  onReject?: (ticker: string) => void;
  loading?: boolean;
}) {
  const isPending = moat.status === "pending";

  const initialScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const [key, power] of Object.entries(moat.powers)) {
      scores[key] = power.score;
    }
    return scores;
  }, [moat.powers]);

  const [editedScores, setEditedScores] = useState<Record<string, number>>(initialScores);

  const editedTotal = useMemo(
    () => Object.values(editedScores).reduce((sum, s) => sum + s, 0),
    [editedScores]
  );

  const hasChanges = useMemo(
    () => Object.entries(moat.powers).some(([key, power]) => editedScores[key] !== power.score),
    [moat.powers, editedScores]
  );

  return (
    <div className="border-t border-stripe-border-light bg-stripe-bg/30">
      {/* Moat Score Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-4">
        <div className="text-sm font-medium text-stripe-ink">
          护城河评分:
          <span className="ml-2 text-lg font-semibold">
            {isPending && hasChanges ? editedTotal : moat.totalScore}
          </span>
          <span className="text-stripe-ink-lighter">/{moat.maxScore}</span>
          {isPending && hasChanges && (
            <span className="ml-2 text-xs text-stripe-purple">已调整</span>
          )}
        </div>
        {moat.sector && (
          <StatusBadge variant="neutral">{moat.sector}</StatusBadge>
        )}
      </div>

      {/* Powers Grid */}
      <div className="px-5 pb-3 grid grid-cols-4 md:grid-cols-7 gap-3">
        {Object.entries(moat.powers).map(([key, power]) => {
          const Icon = powersIcons[key] || Shield;
          const currentScore = isPending
            ? editedScores[key] ?? power.score
            : power.score;
          const percentage = (currentScore / power.maxScore) * 100;
          return (
            <div key={key} className="p-3 bg-white rounded-lg border border-stripe-border-light">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-stripe-ink-light" />
                <span className="text-xs font-medium text-stripe-ink">
                  {power.name}
                </span>
              </div>
              {isPending ? (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={power.maxScore}
                    step={1}
                    value={currentScore}
                    onChange={(e) =>
                      setEditedScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="omega-slider flex-1"
                  />
                  <span className="text-xs font-medium text-stripe-ink tabular-nums w-7 text-right">
                    {currentScore}/{power.maxScore}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stripe-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stripe-purple rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-stripe-ink">
                    {power.score}/{power.maxScore}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Summary */}
      {moat.aiSummary && (
        <div className="px-5 pb-3">
          <div className="p-3 bg-stripe-info-light rounded-lg">
            <h4 className="text-xs font-medium text-stripe-info-text mb-1">
              AI 分析摘要
            </h4>
            <p className="text-xs text-stripe-ink-light leading-relaxed">
              {moat.aiSummary}
            </p>
          </div>
        </div>
      )}

      {/* Moat Actions (only for pending) */}
      {isPending && (
        <div className="px-5 pb-4 flex items-center justify-between">
          <p className="text-xs text-stripe-ink-lighter">
            分析时间: {new Date(moat.analyzedAt).toLocaleString("zh-CN")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-stripe-border text-stripe-ink hover:bg-stripe-danger-light hover:text-stripe-danger-text hover:border-stripe-danger-light"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(moat.ticker);
              }}
            >
              <XCircle className="w-3.5 h-3.5" />
              拒绝护城河
            </Button>
            <Button
              size="sm"
              className="bg-stripe-success text-white hover:bg-stripe-success/90"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                const adjustedScores = hasChanges ? editedScores : undefined;
                onApprove?.(moat.ticker, adjustedScores);
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              确认护城河
            </Button>
          </div>
        </div>
      )}

      {/* Non-pending: show analysis time */}
      {!isPending && (
        <div className="px-5 pb-3">
          <p className="text-xs text-stripe-ink-lighter">
            分析时间: {new Date(moat.analyzedAt).toLocaleString("zh-CN")}
          </p>
        </div>
      )}
    </div>
  );
}

export function SignalsTable({
  strategy,
  ticker,
  action,
  limit = 50,
  moatMap,
  onMoatApprove,
  onMoatReject,
  moatLoading,
}: SignalsTableProps) {
  const { signals, loading, error, refresh } = useSignals({
    strategy,
    ticker,
    action,
    limit,
    autoRefresh: true,
    refreshInterval: 30000,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isLong = strategy === "long";

  const toggleExpand = useCallback((signalId: string) => {
    setExpandedId((prev) => (prev === signalId ? null : signalId));
  }, []);

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
              const isExpanded = expandedId === signal.id;
              const moat = isLong ? moatMap?.[signal.ticker] : undefined;
              const canExpand = isLong && !!moat;

              return (
                <TableRow
                  key={signal.id}
                  className={`border-b border-stripe-border-light ${
                    canExpand ? "cursor-pointer" : ""
                  } ${isExpanded ? "bg-stripe-bg/50" : "hover:bg-stripe-bg"}`}
                >
                  <TableCell colSpan={8} className="p-0">
                    {/* Signal Row */}
                    <div
                      className="flex items-center px-4 py-3"
                      onClick={canExpand ? () => toggleExpand(signal.id) : undefined}
                    >
                      {/* 股票 */}
                      <div className="flex-1 min-w-[140px]">
                        <Link
                          href={`/stock/${encodeURIComponent(signal.ticker)}`}
                          className="flex items-center gap-3 group"
                          onClick={(e) => e.stopPropagation()}
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
                      </div>
                      {/* 信号 */}
                      <div className="w-[70px]">
                        <StatusBadge variant={signalConfig[signalDisplay].variant}>
                          {signalDisplay}
                        </StatusBadge>
                      </div>
                      {/* 策略 */}
                      <div className="w-[80px]">
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
                      </div>
                      {/* 指标 */}
                      <div className="w-[130px]">
                        <span className="text-sm text-stripe-ink">
                          {signal.indicator}: {signal.indicatorValue}
                        </span>
                      </div>
                      {/* 价格 */}
                      <div className="w-[100px]">
                        <p className="text-sm font-medium text-stripe-ink">
                          ${signal.price?.toFixed(2) || "-"}
                        </p>
                        {signal.targetPrice && (
                          <p className="text-xs text-stripe-ink-lighter">
                            目标: ${signal.targetPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                      {/* 触发时间 */}
                      <div className="w-[100px]">
                        <span className="text-sm text-stripe-ink-lighter">
                          {formatTime(signal.triggeredAt)}
                        </span>
                      </div>
                      {/* 原因 */}
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-sm text-stripe-ink-lighter max-w-xs truncate">
                          {signal.reason}
                        </p>
                      </div>
                      {/* 决策 + 展开箭头 */}
                      <div className="w-[140px] flex items-center gap-2">
                        <DecisionCell signal={signal} onUpdate={refresh} />
                        {canExpand && (
                          <button className="p-1 hover:bg-stripe-bg rounded transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stripe-ink-lighter" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stripe-ink-lighter" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Moat Detail */}
                    {isExpanded && moat && (
                      <MoatExpandedRow
                        moat={moat}
                        onApprove={onMoatApprove}
                        onReject={onMoatReject}
                        loading={moatLoading}
                      />
                    )}
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
