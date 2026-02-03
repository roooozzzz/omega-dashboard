"use client";

import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MoatFilters() {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stripe-ink-lighter" />
        <input
          type="text"
          placeholder="Search by ticker or company name..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple transition-colors"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
        >
          <Filter className="w-4 h-4 text-stripe-ink-light" />
          Filters
          <ChevronDown className="w-4 h-4 text-stripe-ink-lighter ml-1" />
        </Button>

        <div className="flex items-center border border-stripe-border rounded-md overflow-hidden">
          <button className="px-3 py-2 text-sm font-medium bg-stripe-purple text-white">
            All
          </button>
          <button className="px-3 py-2 text-sm font-medium text-stripe-ink-light hover:bg-stripe-bg border-l border-stripe-border">
            Pending
          </button>
          <button className="px-3 py-2 text-sm font-medium text-stripe-ink-light hover:bg-stripe-bg border-l border-stripe-border">
            Verified
          </button>
          <button className="px-3 py-2 text-sm font-medium text-stripe-ink-light hover:bg-stripe-bg border-l border-stripe-border">
            Rejected
          </button>
        </div>
      </div>
    </div>
  );
}
