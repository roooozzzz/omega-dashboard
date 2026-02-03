"use client";

import { TrendingUp, TrendingDown, Eye, AlertCircle } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

const stats: StatCard[] = [
  {
    label: "活跃信号",
    value: "23",
    change: "+5 今日",
    changeType: "positive",
    icon: <AlertCircle className="w-5 h-5 text-stripe-purple" />,
  },
  {
    label: "买入信号",
    value: "8",
    icon: <TrendingUp className="w-5 h-5 text-stripe-success" />,
  },
  {
    label: "卖出信号",
    value: "4",
    icon: <TrendingDown className="w-5 h-5 text-stripe-danger" />,
  },
  {
    label: "观望信号",
    value: "11",
    icon: <Eye className="w-5 h-5 text-stripe-warning" />,
  },
];

export function SignalsStats() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
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
  );
}
