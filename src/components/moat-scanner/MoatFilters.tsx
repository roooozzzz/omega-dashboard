"use client";

import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoatFiltersProps {
  onFilterChange?: (filter: string) => void;
  currentFilter?: string;
}

export function MoatFilters({
  onFilterChange,
  currentFilter = "",
}: MoatFiltersProps) {
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

        {/* Status Filter */}
        <select
          value={currentFilter}
          onChange={(e) => onFilterChange?.(e.target.value)}
          className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
        >
          <option value="">全部状态</option>
          <option value="待审核">待审核</option>
          <option value="已通过">已通过</option>
          <option value="已拒绝">已拒绝</option>
        </select>

        <Button
          variant="outline"
          className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
        >
          <Filter className="w-4 h-4" />
          更多筛选
        </Button>
      </div>
    </div>
  );
}
