"use client";

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMarketData } from "@/hooks/useMarketData";

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
  const { data, loading, error } = useMarketData(60000); // 每分钟刷新

  // 如果加载中或有错误，显示 demo 数据
  if (loading || error || !data) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {demoMarketData.map((card) => (
          <MarketCardComponent key={card.label} card={card} />
        ))}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <Loader2 className="w-6 h-6 animate-spin text-stripe-purple" />
          </div>
        )}
      </div>
    );
  }

  // 格式化真实数据
  const formatNumber = (num: number) => num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const formatPercent = (num: number) => `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;

  const getVIXStatus = (value: number): { status: MarketCard["status"]; label: string } => {
    if (value >= 30) return { status: "danger", label: "极端恐慌" };
    if (value >= 25) return { status: "warning", label: "高波动" };
    if (value >= 20) return { status: "neutral", label: "中波动" };
    if (value >= 15) return { status: "neutral", label: "适中" };
    return { status: "success", label: "低波动" };
  };

  const realMarketData: MarketCard[] = [];

  // 标普500
  if (data.sp500) {
    realMarketData.push({
      label: "标普500指数",
      value: formatNumber(data.sp500.value),
      change: formatPercent(data.sp500.changePercent),
      changeType: data.sp500.change >= 0 ? "positive" : "negative",
    });
  }

  // VIX
  if (data.vix) {
    const vixStatus = getVIXStatus(data.vix.value);
    realMarketData.push({
      label: "VIX 恐慌指数",
      value: data.vix.value.toFixed(2),
      change: formatPercent(data.vix.changePercent),
      changeType: data.vix.change <= 0 ? "positive" : "negative", // VIX 下跌是好事
      status: vixStatus.status,
      statusLabel: vixStatus.label,
    });
  }

  // 熔断器状态
  realMarketData.push({
    label: "熔断器",
    value: "关闭",
    status: "success",
    statusLabel: "正常",
  });

  // 今日信号（静态，需要后端支持）
  realMarketData.push({
    label: "今日信号",
    value: "7",
    status: "neutral",
    statusLabel: "待审核",
  });

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {realMarketData.map((card) => (
        <MarketCardComponent key={card.label} card={card} />
      ))}
    </div>
  );
}
