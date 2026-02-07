"use client";

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMarketData } from "@/hooks/useMarketData";
import { useSignals } from "@/hooks/useSignals";

interface MarketCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  status?: "success" | "warning" | "danger" | "neutral";
  statusLabel?: string;
}

// 静态 demo 数据（API 失败时使用）
const demoMarketData: MarketCard[] = [
  {
    label: "标普500指数",
    value: "5,234.18",
    change: "+1.24%",
    changeType: "positive",
  },
  {
    label: "纳斯达克100",
    value: "18,432.50",
    change: "+1.68%",
    changeType: "positive",
  },
  {
    label: "VIX 恐慌指数",
    value: "14.32",
    change: "-2.15%",
    changeType: "positive",
    status: "success",
    statusLabel: "低波动",
  },
  {
    label: "熔断器",
    value: "关闭",
    status: "success",
    statusLabel: "正常",
  },
  {
    label: "今日信号",
    value: "7",
    status: "neutral",
    statusLabel: "待审核",
  },
];

function MarketCardComponent({ card }: { card: MarketCard }) {
  return (
    <div className="bg-white rounded-lg border border-stripe-border p-5 shadow-[var(--shadow-omega-sm)]">
      <p className="text-sm text-stripe-ink-lighter mb-1">{card.label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-stripe-ink">
          {card.value}
        </span>
        {card.change && (
          <span
            className={`flex items-center gap-0.5 text-sm font-medium ${
              card.changeType === "positive"
                ? "text-stripe-success"
                : card.changeType === "negative"
                ? "text-stripe-danger"
                : "text-stripe-ink-lighter"
            }`}
          >
            {card.changeType === "positive" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : card.changeType === "negative" ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : null}
            {card.change}
          </span>
        )}
      </div>
      {card.status && card.statusLabel && (
        <div className="mt-2">
          <StatusBadge variant={card.status}>{card.statusLabel}</StatusBadge>
        </div>
      )}
    </div>
  );
}

export function MarketStatusBar() {
  const { data: marketData, loading: marketLoading, error: marketError } = useMarketData(60000);
  const { stats: signalStats, loading: signalsLoading } = useSignals({ limit: 1 });

  const loading = marketLoading || signalsLoading;
  const error = marketError;

  // 如果加载中或有错误，显示 demo 数据
  if (loading || error || !marketData) {
    return (
      <div className="relative grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {demoMarketData.map((card) => (
          <MarketCardComponent key={card.label} card={card} />
        ))}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-stripe-purple" />
          </div>
        )}
      </div>
    );
  }

  // 格式化真实数据
  const formatNumber = (num: number) => (num ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const formatPercent = (num: number) => { const n = num ?? 0; return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`; };

  const getVIXStatus = (value: number): { status: MarketCard["status"]; label: string } => {
    if (value >= 30) return { status: "danger", label: "极端恐慌" };
    if (value >= 25) return { status: "warning", label: "高波动" };
    if (value >= 20) return { status: "neutral", label: "中波动" };
    if (value >= 15) return { status: "neutral", label: "适中" };
    return { status: "success", label: "低波动" };
  };

  const realMarketData: MarketCard[] = [];

  // 标普500
  if (marketData.spx) {
    realMarketData.push({
      label: "标普500指数",
      value: formatNumber(marketData.spx.value),
      change: formatPercent(marketData.spx.changePercent),
      changeType: marketData.spx.change >= 0 ? "positive" : "negative",
    });
  }

  // 纳斯达克100
  if (marketData.ndx) {
    realMarketData.push({
      label: "纳斯达克100",
      value: formatNumber(marketData.ndx.value),
      change: formatPercent(marketData.ndx.changePercent),
      changeType: marketData.ndx.change >= 0 ? "positive" : "negative",
    });
  }

  // VIX
  if (marketData.vix) {
    const vixStatus = getVIXStatus(marketData.vix.value);
    realMarketData.push({
      label: "VIX 恐慌指数",
      value: marketData.vix.value.toFixed(2),
      change: formatPercent(marketData.vix.changePercent),
      changeType: marketData.vix.change <= 0 ? "positive" : "negative",
      status: vixStatus.status,
      statusLabel: vixStatus.label,
    });
  }

  // 熔断器状态
  realMarketData.push({
    label: "熔断器",
    value: marketData.circuitBreaker ? "触发" : "关闭",
    status: marketData.circuitBreaker ? "danger" : "success",
    statusLabel: marketData.circuitBreaker ? "警告" : "正常",
  });

  // 今日信号（从后端获取）
  const activeSignals = signalStats?.active || 0;
  const totalSignals = signalStats?.total || 0;
  const pendingDecisions = signalStats?.byDecision?.pending || 0;
  const signalStatusLabel = pendingDecisions > 0
    ? `${pendingDecisions} 待处理`
    : activeSignals > 0
    ? `${activeSignals} 活跃`
    : "无活跃";
  realMarketData.push({
    label: "今日信号",
    value: String(totalSignals),
    status: pendingDecisions > 0 ? "warning" : activeSignals > 0 ? "warning" : "neutral",
    statusLabel: signalStatusLabel,
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {realMarketData.map((card) => (
        <MarketCardComponent key={card.label} card={card} />
      ))}
    </div>
  );
}
