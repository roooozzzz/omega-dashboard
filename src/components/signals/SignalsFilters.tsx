"use client";

import { Search } from "lucide-react";

interface SignalsFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  action: string;
  onActionChange: (value: string) => void;
}

export function SignalsFilters({
  searchText,
  onSearchChange,
  action,
  onActionChange,
}: SignalsFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-stripe-border p-4 mb-6 shadow-[var(--shadow-omega-sm)]">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stripe-ink-lighter" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索股票代码或公司名称..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-stripe-border rounded-md focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
          />
        </div>

        {/* Signal Action Filter */}
        <select
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
        >
          <option value="">全部信号</option>
          <option value="BUY">买入</option>
          <option value="SELL">卖出</option>
          <option value="HOLD">观望</option>
          <option value="WATCH">预警</option>
        </select>
      </div>
    </div>
  );
}
