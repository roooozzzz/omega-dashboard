"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStockData } from "@/hooks/useMarketData";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  const router = useRouter();
  const { data, loading, error, refresh } = useStockData(symbol);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return "N/A";
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const formatPercent = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return "N/A";
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const formatMarketCap = (num: number | undefined) => {
    if (!num || isNaN(num)) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      <MainContent>
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-stripe-border px-4 md:px-6 lg:px-8 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-stripe-bg rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-stripe-ink-light" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-stripe-ink">{symbol}</h1>
                <p className="text-sm text-stripe-ink-lighter">
                  {data?.name || "加载中..."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={refresh}
              disabled={loading}
              className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-2">刷新</span>
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          {error ? (
            <div className="bg-stripe-danger-light p-4 rounded-lg text-stripe-danger">
              {error}
            </div>
          ) : (
            <>
              {/* 价格卡片 */}
              <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 mb-6 shadow-[var(--shadow-omega-sm)]">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-stripe-ink">
                      ${formatNumber(data?.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {data && data.change >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-stripe-success" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-stripe-danger" />
                      )}
                      <span
                        className={`text-lg font-medium ${
                          data && data.change >= 0
                            ? "text-stripe-success"
                            : "text-stripe-danger"
                        }`}
                      >
                        {formatPercent(data?.changePercent)}
                      </span>
                      <span className="text-stripe-ink-lighter">
                        ({data?.change && data.change >= 0 ? "+" : ""}
                        {formatNumber(data?.change)})
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div>
                      <p className="text-sm text-stripe-ink-lighter">市值</p>
                      <p className="text-base md:text-lg font-semibold text-stripe-ink">
                        {formatMarketCap(data?.marketCap)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-stripe-ink-lighter">市盈率</p>
                      <p className="text-base md:text-lg font-semibold text-stripe-ink">
                        {formatNumber(data?.pe)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-stripe-ink-lighter">成交量</p>
                      <p className="text-base md:text-lg font-semibold text-stripe-ink">
                        {data?.volume ? (data.volume / 1e6).toFixed(2) + "M" : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-stripe-ink-lighter">更新时间</p>
                      <p className="text-sm text-stripe-ink">
                        {data?.updatedAt
                          ? new Date(data.updatedAt).toLocaleTimeString("zh-CN")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 技术指标 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {/* RS Rating */}
                <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                  <h3 className="font-semibold text-stripe-ink mb-4">中线指标 · RS 评级</h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold ${
                        (data?.rsRating || 0) >= 85
                          ? "bg-stripe-success-light text-stripe-success"
                          : (data?.rsRating || 0) >= 70
                          ? "bg-stripe-warning-light text-stripe-warning"
                          : "bg-stripe-danger-light text-stripe-danger"
                      }`}
                    >
                      {data?.rsRating || "N/A"}
                    </div>
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-stripe-ink-lighter">6 个月收益</span>
                          <span className={data?.return6m && data.return6m >= 0 ? "text-stripe-success" : "text-stripe-danger"}>
                            {formatPercent(data?.return6m)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-stripe-ink-lighter">3 个月收益</span>
                          <span className={data?.return3m && data.return3m >= 0 ? "text-stripe-success" : "text-stripe-danger"}>
                            {formatPercent(data?.return3m)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-stripe-ink-lighter">1 个月收益</span>
                          <span className={data?.return1m && data.return1m >= 0 ? "text-stripe-success" : "text-stripe-danger"}>
                            {formatPercent(data?.return1m)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RSI */}
                <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                  <h3 className="font-semibold text-stripe-ink mb-4">短线指标 · RSI</h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold ${
                        data?.rsiSignal === "oversold"
                          ? "bg-stripe-danger-light text-stripe-danger"
                          : data?.rsiSignal === "overbought"
                          ? "bg-stripe-success-light text-stripe-success"
                          : "bg-stripe-bg text-stripe-ink"
                      }`}
                    >
                      {data?.rsi?.toFixed(0) || "N/A"}
                    </div>
                    <div className="flex-1">
                      <StatusBadge
                        variant={
                          data?.rsiSignal === "oversold"
                            ? "danger"
                            : data?.rsiSignal === "overbought"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {data?.rsiSignal === "oversold"
                          ? "超卖"
                          : data?.rsiSignal === "overbought"
                          ? "超买"
                          : "中性"}
                      </StatusBadge>
                      <p className="text-sm text-stripe-ink-lighter mt-2">
                        {data?.rsiSignal === "oversold"
                          ? "RSI < 30，可能存在反弹机会"
                          : data?.rsiSignal === "overbought"
                          ? "RSI > 70，注意回调风险"
                          : "RSI 处于中性区间"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 布林带 */}
                <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                  <h3 className="font-semibold text-stripe-ink mb-4">短线指标 · 布林带</h3>
                  {data?.bollinger ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-stripe-ink-lighter">上轨</span>
                        <span className="text-stripe-ink font-medium">
                          ${formatNumber(data.bollinger.upper)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stripe-ink-lighter">中轨</span>
                        <span className="text-stripe-ink font-medium">
                          ${formatNumber(data.bollinger.middle)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stripe-ink-lighter">下轨</span>
                        <span className="text-stripe-ink font-medium">
                          ${formatNumber(data.bollinger.lower)}
                        </span>
                      </div>
                      <div className="pt-2">
                        <StatusBadge
                          variant={
                            data.bollinger.position === "below"
                              ? "danger"
                              : data.bollinger.position === "above"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {data.bollinger.position === "below"
                            ? "接近下轨"
                            : data.bollinger.position === "above"
                            ? "突破上轨"
                            : "中轨附近"}
                        </StatusBadge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stripe-ink-lighter">数据不足</p>
                  )}
                </div>
              </div>

              {/* 策略建议 */}
              <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                <h3 className="font-semibold text-stripe-ink mb-4">OMEGA 策略建议</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-stripe-bg rounded-lg">
                    <p className="text-sm font-medium text-stripe-ink mb-2">长线 · THE CORE</p>
                    <p className="text-xs text-stripe-ink-lighter">
                      需要护城河评分 ≥ 20 分，并通过人工审核
                    </p>
                    <StatusBadge variant="neutral" className="mt-2">
                      需分析护城河
                    </StatusBadge>
                  </div>
                  <div className="p-4 bg-stripe-bg rounded-lg">
                    <p className="text-sm font-medium text-stripe-ink mb-2">中线 · THE FLOW</p>
                    <p className="text-xs text-stripe-ink-lighter">
                      RS 评级 ≥ 85，且处于上升趋势
                    </p>
                    <StatusBadge
                      variant={(data?.rsRating || 0) >= 85 ? "success" : "warning"}
                      className="mt-2"
                    >
                      {(data?.rsRating || 0) >= 85 ? "符合条件" : "RS 不足"}
                    </StatusBadge>
                  </div>
                  <div className="p-4 bg-stripe-bg rounded-lg">
                    <p className="text-sm font-medium text-stripe-ink mb-2">短线 · THE SWING</p>
                    <p className="text-xs text-stripe-ink-lighter">
                      RSI {"<"} 30 买入，RSI {">"} 70 卖出
                    </p>
                    <StatusBadge
                      variant={
                        data?.rsiSignal === "oversold"
                          ? "danger"
                          : data?.rsiSignal === "overbought"
                          ? "success"
                          : "neutral"
                      }
                      className="mt-2"
                    >
                      {data?.rsiSignal === "oversold"
                        ? "超卖信号"
                        : data?.rsiSignal === "overbought"
                        ? "超买信号"
                        : "无信号"}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </MainContent>
    </div>
  );
}
