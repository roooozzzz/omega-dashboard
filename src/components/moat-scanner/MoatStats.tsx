"use client";

import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

const stats: StatCard[] = [
  {
    label: "已分析总数",
    value: "156",
    change: "+12 本周",
    changeType: "positive",
    icon: <TrendingUp className="w-5 h-5 text-stripe-purple" />,
  },
  {
    label: "待审核",
    value: "7",
    icon: <Clock className="w-5 h-5 text-stripe-warning" />,
  },
  {
    label: "已通过",
    value: "89",
    change: "57%",
    changeType: "positive",
    icon: <CheckCircle className="w-5 h-5 text-stripe-success" />,
  },
  {
    label: "已拒绝",
    value: "60",
    change: "38%",
    changeType: "negative",
    icon: <XCircle className="w-5 h-5 text-stripe-danger" />,
  },
];

export function MoatStats() {
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
