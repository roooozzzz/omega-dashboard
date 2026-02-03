"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { MiniSparkline } from "@/components/charts/PriceChart";

interface MiniChartCardProps {
  title: string;
  value: string;
  change: number;
  changePercent: number;
  sparklineData: number[];
}

export function MiniChartCard({
  title,
  value,
  change,
  changePercent,
  sparklineData,
}: MiniChartCardProps) {
  const isUp = change >= 0;

  return (
    <div className="bg-white rounded-lg border border-stripe-border p-4 shadow-[var(--shadow-omega-sm)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-stripe-ink-lighter">{title}</p>
          <p className="text-xl font-semibold text-stripe-ink mt-1">{value}</p>
        </div>
        <MiniSparkline data={sparklineData} />
      </div>
      <div className="flex items-center gap-1">
        {isUp ? (
          <TrendingUp className="w-4 h-4 text-stripe-success" />
        ) : (
          <TrendingDown className="w-4 h-4 text-stripe-danger" />
        )}
        <span
          className={`text-sm font-medium ${
            isUp ? "text-stripe-success" : "text-stripe-danger"
          }`}
        >
          {isUp ? "+" : ""}
          {changePercent.toFixed(2)}%
        </span>
        <span className="text-xs text-stripe-ink-lighter ml-1">
          ({isUp ? "+" : ""}
          {change.toFixed(2)})
        </span>
      </div>
    </div>
  );
}

// Demo 数据
export const demoSparklineData = {
  sp500: [5100, 5120, 5080, 5150, 5180, 5160, 5200, 5234],
  nasdaq: [16200, 16350, 16100, 16400, 16500, 16450, 16600, 16700],
  dow: [38200, 38350, 38100, 38400, 38500, 38450, 38600, 38700],
  vix: [15.2, 14.8, 15.5, 14.2, 14.0, 14.5, 14.1, 14.32],
};
