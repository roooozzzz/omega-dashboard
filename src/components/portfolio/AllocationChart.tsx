"use client";

import { Building2, TrendingUp, Zap } from "lucide-react";

interface AllocationData {
  label: string;
  target: number;
  actual: number;
  icon: React.ReactNode;
  color: string;
}

export function AllocationChart() {
  const allocations: AllocationData[] = [
    {
      label: "长线 (THE CORE)",
      target: 50,
      actual: 0,
      icon: <Building2 className="w-4 h-4" />,
      color: "#0A2540",
    },
    {
      label: "中线 (THE FLOW)",
      target: 30,
      actual: 0,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "#635BFF",
    },
    {
      label: "短线 (THE SWING)",
      target: 20,
      actual: 0,
      icon: <Zap className="w-4 h-4" />,
      color: "#FFBB00",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-stripe-border p-5 shadow-[var(--shadow-omega-sm)] mb-6">
      <h3 className="font-semibold text-stripe-ink mb-4">策略配置</h3>

      {/* Visual Bar - empty state */}
      <div className="h-4 rounded-full overflow-hidden flex mb-6 bg-stripe-bg">
        {allocations.map((alloc) => (
          <div
            key={alloc.label}
            className="h-full"
            style={{
              width: `${alloc.actual}%`,
              backgroundColor: alloc.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4">
        {allocations.map((alloc) => (
          <div key={alloc.label} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: alloc.color }}
            />
            <div className="flex-1">
              <p className="text-sm text-stripe-ink font-medium">
                {alloc.label}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stripe-ink-lighter">
                  目标: {alloc.target}%
                </span>
                <span className="text-stripe-ink-lighter">
                  实际: {alloc.actual.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
