"use client";

import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MoatFilters() {
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
          <option value="">全部行业</option>
          <option value="tech">科技</option>
          <option value="security">网络安全</option>
          <option value="cloud">云计算</option>
          <option value="fintech">金融科技</option>
        </select>

        <select className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple">
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="verified">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>

        <select className="px-3 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple">
          <option value="">全部置信度</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
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
