"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Zap,
  PieChart,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { SIGNAL_GLOSSARY, matchIndicatorGlossary } from "@/lib/glossary";
import { MoatPowersGrid } from "@/components/signals/MoatPowersGrid";
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

type SignalTypeDisplay = "买入" | "卖出" | "观望" | "预警";
type StrategyType = "index" | "long" | "mid" | "short";

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
  index: {
    label: "指数",
    icon: PieChart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
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
  strategy?: "index" | "long" | "mid" | "short";
  ticker?: string;
  action?: string;
  limit?: number;
  moatMap?: Record<string, MoatData>;
  onMoatApprove?: (ticker: string, adjustedScores?: Record<string, number>) => void;
  onMoatReject?: (ticker: string) => void;
  moatLoading?: boolean;
  crossStrategyMap?: Record<string, Array<{ strategy: "index" | "long" | "mid" | "short"; indicator: string }>>;
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
            {hasChanges ? editedTotal : moat.totalScore}
          </span>
          <span className="text-stripe-ink-lighter">/{moat.maxScore}</span>
          {hasChanges && (
            <span className="ml-2 text-xs text-stripe-purple">已调整</span>
          )}
        </div>
        {moat.sector && (
          <StatusBadge variant="neutral">{moat.sector}</StatusBadge>
        )}
        <SourceBadge source={moat.source} />
        {!isPending && (
          <StatusBadge variant={moat.status === "verified" ? "success" : "danger"}>
            {moat.status === "verified" ? "已通过" : "已拒绝"}
          </StatusBadge>
        )}
      </div>

      {/* Powers Grid */}
      <div className="px-5 pb-3">
        <MoatPowersGrid
          powers={moat.powers}
          editedScores={editedScores}
          onScoreChange={(key, value) =>
            setEditedScores((prev) => ({ ...prev, [key]: value }))
          }
          ticker={moat.ticker}
        />
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

      {/* Actions — always available */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <p className="text-xs text-stripe-ink-lighter">
          分析时间: {new Date(moat.analyzedAt).toLocaleString("zh-CN")}
          {moat.reviewedAt && ` · 审核时间: ${new Date(moat.reviewedAt).toLocaleString("zh-CN")}`}
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
            {isPending ? "拒绝护城河" : "重新拒绝"}
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
            {isPending ? "确认护城河" : hasChanges ? "重新审批" : "重新确认"}
          </Button>
        </div>
      </div>
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
  crossStrategyMap,
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
              <TableCell colSpan={8} className="p-0">
                <div className="flex items-center px-4 py-2.5 min-w-[900px]">
                  <div className="w-[160px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">股票</div>
                  <div className="w-[70px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide flex items-center gap-0.5">
                    信号
                    <InfoTooltip entry={SIGNAL_GLOSSARY.signalColumn} />
                  </div>
                  <div className="w-[80px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide flex items-center gap-0.5">
                    策略
                    <InfoTooltip entry={SIGNAL_GLOSSARY.strategyColumn} />
                  </div>
                  <div className="w-[150px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide flex items-center gap-0.5">
                    指标
                    <InfoTooltip entry={SIGNAL_GLOSSARY.indicatorColumn} />
                  </div>
                  <div className="w-[110px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">价格</div>
                  <div className="w-[100px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">触发时间</div>
                  <div className="flex-1 min-w-[100px] text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide flex items-center gap-0.5">
                    原因
                    <InfoTooltip entry={
                      strategy === "index" ? SIGNAL_GLOSSARY.reasonColumnIndex
                        : strategy === "long" ? SIGNAL_GLOSSARY.reasonColumnLong
                        : strategy === "mid" ? SIGNAL_GLOSSARY.reasonColumnMid
                        : strategy === "short" ? SIGNAL_GLOSSARY.reasonColumnShort
                        : SIGNAL_GLOSSARY.reasonColumnLong
                    } />
                  </div>
                  <div className="w-[140px] shrink-0 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">决策</div>
                </div>
              </TableCell>
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
                      className="flex items-center px-4 py-3 min-w-[900px]"
                      onClick={canExpand ? () => toggleExpand(signal.id) : undefined}
                    >
                      {/* 股票 */}
                      <div className="w-[160px] shrink-0">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/stock/${encodeURIComponent(signal.ticker)}`}
                            className="w-8 h-8 rounded-full bg-stripe-bg flex items-center justify-center shrink-0 group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-sm font-medium text-stripe-ink">
                              {signal.ticker[0]}
                            </span>
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/stock/${encodeURIComponent(signal.ticker)}`}
                              className="block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="font-medium text-sm text-stripe-ink hover:text-stripe-purple transition-colors truncate">
                                {signal.ticker}
                              </p>
                              <p className="text-xs text-stripe-ink-lighter truncate">
                                {signal.name || signal.ticker}
                              </p>
                            </Link>
                            {(() => {
                              const crossEntries = crossStrategyMap?.[signal.ticker]?.filter(
                                (s) => s.strategy !== signal.strategy
                              );
                              if (!crossEntries || crossEntries.length === 0) return null;
                              return (
                                <p className="text-[11px] text-stripe-ink-lighter mt-0.5 truncate">
                                  也在:{" "}
                                  {crossEntries.map((entry, idx) => {
                                    const route = `/signals/${entry.strategy}`;
                                    const label = strategyConfig[entry.strategy]?.label || entry.strategy;
                                    const color = strategyConfig[entry.strategy]?.color || "text-stripe-ink";
                                    return (
                                      <span key={entry.strategy}>
                                        {idx > 0 && "、"}
                                        <Link
                                          href={route}
                                          className={`${color} hover:underline font-medium`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {label}
                                        </Link>
                                        <span className="text-stripe-ink-lighter"> ({entry.indicator})</span>
                                      </span>
                                    );
                                  })}
                                </p>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      {/* 信号 */}
                      <div className="w-[70px] shrink-0">
                        <StatusBadge variant={signalConfig[signalDisplay].variant}>
                          {signalDisplay}
                        </StatusBadge>
                      </div>
                      {/* 策略 */}
                      <div className="w-[80px] shrink-0">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
                            strategyConfig[signal.strategy]?.bg || "bg-stripe-bg"
                          }`}
                        >
                          <StratIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              strategyConfig[signal.strategy]?.color || "text-stripe-ink"
                            }`}
                          />
                          <span
                            className={`text-xs font-medium whitespace-nowrap ${
                              strategyConfig[signal.strategy]?.color || "text-stripe-ink"
                            }`}
                          >
                            {strategyConfig[signal.strategy]?.label || signal.strategy}
                          </span>
                        </div>
                      </div>
                      {/* 指标 */}
                      <div className="w-[150px] shrink-0">
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm text-stripe-ink truncate">
                            {signal.indicator}: {signal.indicatorValue}
                          </span>
                          {(() => {
                            const entry = matchIndicatorGlossary(signal.indicator || "");
                            return entry ? <InfoTooltip entry={entry} /> : null;
                          })()}
                        </div>
                      </div>
                      {/* 价格 */}
                      <div className="w-[110px] shrink-0">
                        <p className="text-sm font-medium text-stripe-ink whitespace-nowrap">
                          ${signal.price?.toFixed(2) || "-"}
                        </p>
                        {signal.targetPrice && (
                          <p className="text-xs text-stripe-ink-lighter whitespace-nowrap">
                            目标: ${signal.targetPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                      {/* 触发时间 */}
                      <div className="w-[100px] shrink-0">
                        <span className="text-sm text-stripe-ink-lighter whitespace-nowrap">
                          {formatTime(signal.triggeredAt)}
                        </span>
                      </div>
                      {/* 原因 */}
                      <div className="flex-1 min-w-[100px]">
                        {signal.reasons && signal.reasons.length > 0 ? (
                          <div className="space-y-0.5">
                            {signal.reasons.map((r, i) => {
                              const reasonEntry = matchIndicatorGlossary(r);
                              return (
                                <div key={i} className="flex items-center gap-0.5">
                                  <p className={`text-xs leading-snug ${i === 0 ? "text-stripe-ink font-medium" : "text-stripe-ink-lighter"}`}>
                                    {r}
                                  </p>
                                  {reasonEntry && <InfoTooltip entry={reasonEntry} />}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-stripe-ink-lighter">—</p>
                        )}
                      </div>
                      {/* 决策 + 展开箭头 */}
                      <div className="w-[140px] shrink-0 flex items-center gap-2">
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
