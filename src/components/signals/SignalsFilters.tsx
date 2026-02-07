"use client";

import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignalsFiltersProps {
  strategy?: string | null;
  onStrategyChange?: (strategy: string | null) => void;
}

export function SignalsFilters({ strategy, onStrategyChange }: SignalsFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-stripe-border p-4 mb-6 shadow-[var(--shadow-omega-sm)]">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stripe-ink-lighter" />
          <input
            type="text"
            placeholder="搜索股票代码或公司名称..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-stripe-border rounded-md focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
          />
        </div>

        {/* Filters */}
        <select className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple">
          <option value="">全部信号</option>
          <option value="buy">买入</option>
          <option value="sell">卖出</option>
          <option value="watch">观望</option>
          <option value="alert">预警</option>
        </select>

        <select
          value={strategy ?? ""}
          onChange={(e) => onStrategyChange?.(e.target.value || null)}
          className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
        >
          <option value="">全部策略</option>
          <option value="long">长线</option>
          <option value="mid">中线</option>
          <option value="short">短线</option>
        </select>

        <select className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple">
          <option value="">时间范围</option>
          <option value="today">今日</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
        </select>

        <Button
          variant="outline"
          className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
        >
          <Download className="w-4 h-4" />
          导出
        </Button>
      </div>
    </div>
  );
}
