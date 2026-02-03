"use client";

import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface MarketCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  status?: "success" | "warning" | "danger" | "neutral";
  statusLabel?: string;
}

const marketData: MarketCard[] = [
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

export function MarketStatusBar() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {marketData.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-stripe-border p-5 shadow-[var(--shadow-omega-sm)]"
        >
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
      ))}
    </div>
  );
}
