"use client";

import Link from "next/link";
import { RefreshCw, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useIndexWatchlist } from "@/hooks/useIndexData";
import type { IndexETFData } from "@/lib/api";

function HealthDot({ status }: { status: IndexETFData["healthStatus"] }) {
  const colors = {
    healthy: "bg-emerald-500",
    watch: "bg-yellow-500",
    caution: "bg-red-500",
  };
  const labels = {
    healthy: "健康",
    watch: "观望",
    caution: "谨慎",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-xs text-stripe-ink-lighter">{labels[status]}</span>
    </div>
  );
}

function ETFCard({ etf }: { etf: IndexETFData }) {
  const isUp = etf.changePercent >= 0;
  const peRatio = etf.pe5yAvg > 0 ? etf.pe / etf.pe5yAvg : 1;
  const peStatus = peRatio < 0.9 ? "text-emerald-600" : peRatio > 1.1 ? "text-red-500" : "text-stripe-ink";

  return (
    <Link
      href={`/stock/${etf.symbol}`}
      className="block bg-white dark:bg-[#16161D] rounded-lg border border-stripe-border dark:border-[#2A2A35] p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-[var(--shadow-omega-sm)] transition-all group"
    >
      {/* 头部：代码 + 状态灯 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stripe-ink dark:text-white">{etf.symbol}</span>
            <ArrowRight className="w-3.5 h-3.5 text-stripe-ink-lighter opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-stripe-ink-lighter dark:text-gray-500 mt-0.5">{etf.name}</p>
        </div>
        <HealthDot status={etf.healthStatus} />
      </div>

      {/* 价格 */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-semibold text-stripe-ink dark:text-white">
          ${etf.price.toFixed(2)}
        </span>
        <span className={`text-sm font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
          {isUp ? "+" : ""}{etf.changePercent.toFixed(2)}%
        </span>
        {isUp ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        )}
      </div>

      {/* 指标网格 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-stripe-ink-lighter dark:text-gray-500">PE</span>
          <span className={`font-medium ${peStatus}`}>
            {etf.pe.toFixed(1)}
            <span className="text-stripe-ink-lighter dark:text-gray-600 font-normal"> / {etf.pe5yAvg.toFixed(1)}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stripe-ink-lighter dark:text-gray-500">股息率</span>
          <span className="font-medium text-stripe-ink dark:text-gray-300">{etf.dividendYield.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stripe-ink-lighter dark:text-gray-500">MA200</span>
          <span className={`font-medium ${etf.aboveMa200 ? "text-emerald-600" : "text-red-500"}`}>
            {etf.aboveMa200 ? "上方" : "下方"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stripe-ink-lighter dark:text-gray-500">RSI(14)</span>
          <span className={`font-medium ${etf.rsi14 < 30 ? "text-emerald-600" : etf.rsi14 > 70 ? "text-red-500" : "text-stripe-ink dark:text-gray-300"}`}>
            {etf.rsi14.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 底部：跟踪指数 + 费率 */}
      <div className="mt-3 pt-2.5 border-t border-stripe-border-light dark:border-[#2A2A35] flex items-center justify-between text-xs text-stripe-ink-lighter dark:text-gray-500">
        <span>{etf.indexTracked}</span>
        <span>费率 {etf.expenseRatio}%</span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#16161D] rounded-lg border border-stripe-border dark:border-[#2A2A35] p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="h-5 w-12 bg-stripe-bg dark:bg-white/5 rounded" />
          <div className="h-3 w-32 bg-stripe-bg dark:bg-white/5 rounded mt-1" />
        </div>
        <div className="h-4 w-10 bg-stripe-bg dark:bg-white/5 rounded" />
      </div>
      <div className="h-7 w-24 bg-stripe-bg dark:bg-white/5 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-stripe-bg dark:bg-white/5 rounded" />
        <div className="h-3 w-full bg-stripe-bg dark:bg-white/5 rounded" />
        <div className="h-3 w-full bg-stripe-bg dark:bg-white/5 rounded" />
        <div className="h-3 w-full bg-stripe-bg dark:bg-white/5 rounded" />
      </div>
    </div>
  );
}

export function IndexWatchlistPanel() {
  const { etfs, loading, error, refresh } = useIndexWatchlist(true, 60000);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-stripe-ink dark:text-white">ETF 观察名单</h2>
          <p className="text-xs text-stripe-ink-lighter dark:text-gray-500 mt-0.5">
            点击查看详情 · 数据每分钟刷新
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-1.5 hover:bg-stripe-bg dark:hover:bg-white/5 rounded transition-colors"
          title="刷新数据"
        >
          <RefreshCw className="w-4 h-4 text-stripe-ink-lighter dark:text-gray-500" />
        </button>
      </div>

      {error && etfs.length === 0 ? (
        <div className="bg-white dark:bg-[#16161D] rounded-lg border border-stripe-border dark:border-[#2A2A35] p-8 text-center">
          <p className="text-sm text-stripe-ink-lighter dark:text-gray-500 mb-3">{error}</p>
          <button
            onClick={refresh}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : etfs.map((etf) => <ETFCard key={etf.symbol} etf={etf} />)}
        </div>
      )}
    </div>
  );
}
