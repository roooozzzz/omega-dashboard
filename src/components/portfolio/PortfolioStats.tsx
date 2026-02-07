"use client";

import { Wallet, TrendingUp, Briefcase, DollarSign } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

const stats: StatCard[] = [
  {
    label: "总市值",
    value: "$0",
    icon: <Wallet className="w-5 h-5 text-stripe-purple" />,
  },
  {
    label: "总收益",
    value: "$0",
    icon: <TrendingUp className="w-5 h-5 text-stripe-success" />,
  },
  {
    label: "持仓数量",
    value: "0",
    change: "未连接",
    changeType: "neutral",
    icon: <Briefcase className="w-5 h-5 text-stripe-ink-light" />,
  },
  {
    label: "可用现金",
    value: "$0",
    icon: <DollarSign className="w-5 h-5 text-stripe-warning" />,
  },
];

export function PortfolioStats() {
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
