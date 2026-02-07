"use client";

import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface MoatStatsProps {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export function MoatStats({
  total,
  pending,
  verified,
  rejected,
}: MoatStatsProps) {
  const verifiedPct = total > 0 ? Math.round((verified / total) * 100) : 0;
  const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;

  const stats = [
    {
      label: "已分析总数",
      value: String(total),
      icon: <TrendingUp className="w-5 h-5 text-stripe-purple" />,
    },
    {
      label: "待审核",
      value: String(pending),
      icon: <Clock className="w-5 h-5 text-stripe-warning" />,
    },
    {
      label: "已通过",
      value: String(verified),
      change: verifiedPct > 0 ? `${verifiedPct}%` : undefined,
      changeType: "positive" as const,
      icon: <CheckCircle className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "已拒绝",
      value: String(rejected),
      change: rejectedPct > 0 ? `${rejectedPct}%` : undefined,
      changeType: "negative" as const,
      icon: <XCircle className="w-5 h-5 text-stripe-danger" />,
    },
  ];

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
