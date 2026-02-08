"use client";

import { use, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, BarChart3, LineChart, CandlestickChart as CandleIcon, Newspaper, Users, Check, X, Loader2, Shield, Plus, Zap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStockData, useHistoricalData, useSentiment, useRecommendation } from "@/hooks";
import { useSignals } from "@/hooks/useSignals";
import { signalsApi } from "@/lib/api";
import { useMoatData, useMoatActions } from "@/hooks/useMoatData";
import {
  TechnicalChart,
  TimeRangeSelector,
  TimeRange,
  OHLCData,
} from "@/components/charts";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

type ChartType = "technical" | "candle" | "line";

export default function StockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  const router = useRouter();
  const { data, loading, error, refresh } = useStockData(symbol);
  
  // Chart state
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [chartType, setChartType] = useState<ChartType>("technical");
  const [showMA, setShowMA] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [crosshairData, setCrosshairData] = useState<{
    candle: OHLCData | null;
    ma?: Record<number, number | null>;
    bollinger?: { upper: number | null; middle: number | null; lower: number | null };
  } | null>(null);

  const { data: historicalData, loading: histLoading } = useHistoricalData(symbol, timeRange);
  const { data: sentiment } = useSentiment(symbol);
  const { data: recommendations } = useRecommendation(symbol);

  // 信号决策 — 每个策略只保留最新一条
  const { signals: rawSignals, refresh: refreshSignals } = useSignals({ ticker: symbol, limit: 20 });
  const signals = useMemo(() => {
    const seen = new Map<string, typeof rawSignals[0]>();
    for (const sig of rawSignals) {
      const key = sig.strategy;
      if (!seen.has(key)) seen.set(key, sig);
    }
    return Array.from(seen.values());
  }, [rawSignals]);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const handleSignalDecision = useCallback(async (signalId: string, action: "confirm" | "ignore") => {
    setDecidingId(signalId);
    try {
      if (action === "confirm") {
        await signalsApi.confirm(signalId);
        setDecisions(prev => ({ ...prev, [signalId]: "confirmed" }));
      } else {
        await signalsApi.ignore(signalId);
        setDecisions(prev => ({ ...prev, [signalId]: "ignored" }));
      }
      refreshSignals();
    } catch { /* ignore */ } finally {
      setDecidingId(null);
    }
  }, [refreshSignals]);

  // 护城河
  const { data: moatData, loading: moatLoading, error: moatError, refresh: refreshMoat } = useMoatData(symbol);
  const { approve, reject: rejectMoat, propose, approving, rejecting, proposing } = useMoatActions();

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

  const handleCrosshairMove = useCallback((chartData: {
    candle: OHLCData | null;
    ma?: Record<number, number | null>;
    bollinger?: { upper: number | null; middle: number | null; lower: number | null };
  }) => {
    setCrosshairData(chartData);
  }, []);

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

              {/* K线图区域 */}
              <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 mb-6 shadow-[var(--shadow-omega-sm)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-stripe-ink">技术走势</h3>
                    {/* Chart Type Selector */}
                    <div className="flex items-center gap-1 p-1 bg-stripe-bg rounded-lg">
                      <button
                        onClick={() => setChartType("technical")}
                        className={`p-2 rounded-md transition-all ${
                          chartType === "technical"
                            ? "bg-white shadow-sm text-stripe-purple"
                            : "text-stripe-ink-lighter hover:text-stripe-ink"
                        }`}
                        title="技术指标图"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setChartType("candle")}
                        className={`p-2 rounded-md transition-all ${
                          chartType === "candle"
                            ? "bg-white shadow-sm text-stripe-purple"
                            : "text-stripe-ink-lighter hover:text-stripe-ink"
                        }`}
                        title="K线图"
                      >
                        <CandleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setChartType("line")}
                        className={`p-2 rounded-md transition-all ${
                          chartType === "line"
                            ? "bg-white shadow-sm text-stripe-purple"
                            : "text-stripe-ink-lighter hover:text-stripe-ink"
                        }`}
                        title="线图"
                      >
                        <LineChart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <TimeRangeSelector
                    value={timeRange}
                    onChange={setTimeRange}
                    theme="light"
                    size="sm"
                  />
                </div>

                {/* Indicator Toggles */}
                {chartType === "technical" && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm text-stripe-ink-light cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showMA}
                        onChange={(e) => setShowMA(e.target.checked)}
                        className="w-4 h-4 rounded border-stripe-border text-stripe-purple focus:ring-stripe-purple"
                      />
                      <span>均线 (MA5/20/60)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stripe-ink-light cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBollinger}
                        onChange={(e) => setShowBollinger(e.target.checked)}
                        className="w-4 h-4 rounded border-stripe-border text-stripe-purple focus:ring-stripe-purple"
                      />
                      <span>布林带 (BB20,2)</span>
                    </label>
                  </div>
                )}

                {/* Crosshair Data Display */}
                {crosshairData?.candle && (
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-xs md:text-sm">
                    <span className="text-stripe-ink-lighter">
                      日期: <span className="text-stripe-ink font-medium">{crosshairData.candle.time}</span>
                    </span>
                    <span className="text-stripe-ink-lighter">
                      开: <span className="text-stripe-ink font-medium">${formatNumber(crosshairData.candle.open)}</span>
                    </span>
                    <span className="text-stripe-ink-lighter">
                      高: <span className="text-stripe-success font-medium">${formatNumber(crosshairData.candle.high)}</span>
                    </span>
                    <span className="text-stripe-ink-lighter">
                      低: <span className="text-stripe-danger font-medium">${formatNumber(crosshairData.candle.low)}</span>
                    </span>
                    <span className="text-stripe-ink-lighter">
                      收: <span className="text-stripe-ink font-medium">${formatNumber(crosshairData.candle.close)}</span>
                    </span>
                    {crosshairData.ma && showMA && (
                      <>
                        <span className="text-[#635BFF]">
                          MA5: {crosshairData.ma[5]?.toFixed(2) ?? "-"}
                        </span>
                        <span className="text-[#FF9500]">
                          MA20: {crosshairData.ma[20]?.toFixed(2) ?? "-"}
                        </span>
                        <span className="text-[#00C7BE]">
                          MA60: {crosshairData.ma[60]?.toFixed(2) ?? "-"}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Chart */}
                <div className="relative">
                  {histLoading ? (
                    <div className="h-[400px] md:h-[500px] flex items-center justify-center bg-stripe-bg rounded-lg">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-stripe-purple animate-spin" />
                        <span className="text-sm text-stripe-ink-lighter">加载图表数据...</span>
                      </div>
                    </div>
                  ) : historicalData && historicalData.ohlc.length > 0 ? (
                    <TechnicalChart
                      data={historicalData.ohlc}
                      volumeData={historicalData.volume}
                      height={window.innerWidth < 768 ? 400 : 500}
                      theme="light"
                      showMA={showMA && chartType === "technical"}
                      maLengths={[5, 20, 60]}
                      showBollinger={showBollinger && chartType === "technical"}
                      showVolume={chartType !== "line"}
                      onCrosshairMove={handleCrosshairMove}
                    />
                  ) : (
                    <div className="h-[400px] md:h-[500px] flex items-center justify-center bg-stripe-bg rounded-lg">
                      <span className="text-stripe-ink-lighter">暂无图表数据</span>
                    </div>
                  )}
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

              {/* Finnhub 情绪 & 分析师评级 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                {/* 新闻情绪 */}
                <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="w-4 h-4 text-stripe-purple" />
                    <h3 className="font-semibold text-stripe-ink">新闻情绪</h3>
                  </div>
                  {sentiment ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                            sentiment.sentimentScore > 0.2
                              ? "bg-stripe-success-light text-stripe-success"
                              : sentiment.sentimentScore < -0.2
                              ? "bg-stripe-danger-light text-stripe-danger"
                              : "bg-stripe-bg text-stripe-ink"
                          }`}
                        >
                          {sentiment.sentimentScore > 0 ? "+" : ""}
                          {sentiment.sentimentScore.toFixed(2)}
                        </div>
                        <div className="flex-1">
                          <StatusBadge
                            variant={
                              sentiment.sentimentScore > 0.2
                                ? "success"
                                : sentiment.sentimentScore < -0.2
                                ? "danger"
                                : "neutral"
                            }
                          >
                            {sentiment.sentimentScore > 0.2
                              ? "偏多"
                              : sentiment.sentimentScore < -0.2
                              ? "偏空"
                              : "中性"}
                          </StatusBadge>
                          <p className="text-xs text-stripe-ink-lighter mt-1">
                            近一周 {sentiment.buzzArticles} 篇报道
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stripe-ink-lighter">看涨</span>
                          <span className="text-stripe-success font-medium">
                            {(sentiment.bullishPercent * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stripe-ink-lighter">看跌</span>
                          <span className="text-stripe-danger font-medium">
                            {(sentiment.bearishPercent * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stripe-ink-lighter">行业均分</span>
                          <span className="text-stripe-ink font-medium">
                            {sentiment.sectorAvgScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stripe-ink-lighter">行业看涨</span>
                          <span className="text-stripe-ink font-medium">
                            {(sentiment.sectorAvgBullish * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-stripe-ink-lighter">暂无情绪数据</p>
                  )}
                </div>

                {/* 分析师评级 */}
                <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-stripe-purple" />
                    <h3 className="font-semibold text-stripe-ink">分析师评级</h3>
                  </div>
                  {recommendations.length > 0 ? (() => {
                    const latest = recommendations[0];
                    const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
                    const bullish = latest.strongBuy + latest.buy;
                    const bearish = latest.sell + latest.strongSell;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                              bullish > bearish + latest.hold
                                ? "bg-stripe-success-light text-stripe-success"
                                : bearish > bullish
                                ? "bg-stripe-danger-light text-stripe-danger"
                                : "bg-stripe-bg text-stripe-ink"
                            }`}
                          >
                            {total > 0 ? `${Math.round((bullish / total) * 100)}%` : "N/A"}
                          </div>
                          <div className="flex-1">
                            <StatusBadge
                              variant={
                                bullish > bearish + latest.hold
                                  ? "success"
                                  : bearish > bullish
                                  ? "danger"
                                  : "neutral"
                              }
                            >
                              {bullish > bearish + latest.hold
                                ? "多数看好"
                                : bearish > bullish
                                ? "多数看空"
                                : "分歧较大"}
                            </StatusBadge>
                            <p className="text-xs text-stripe-ink-lighter mt-1">
                              {latest.period} | {total} 位分析师
                            </p>
                          </div>
                        </div>
                        {/* Stacked bar */}
                        {total > 0 && (
                          <div className="space-y-1">
                            <div className="flex h-3 rounded-full overflow-hidden">
                              {latest.strongBuy > 0 && (
                                <div
                                  className="bg-[#0E6245]"
                                  style={{ width: `${(latest.strongBuy / total) * 100}%` }}
                                  title={`强力买入 ${latest.strongBuy}`}
                                />
                              )}
                              {latest.buy > 0 && (
                                <div
                                  className="bg-stripe-success"
                                  style={{ width: `${(latest.buy / total) * 100}%` }}
                                  title={`买入 ${latest.buy}`}
                                />
                              )}
                              {latest.hold > 0 && (
                                <div
                                  className="bg-stripe-warning"
                                  style={{ width: `${(latest.hold / total) * 100}%` }}
                                  title={`持有 ${latest.hold}`}
                                />
                              )}
                              {latest.sell > 0 && (
                                <div
                                  className="bg-stripe-danger"
                                  style={{ width: `${(latest.sell / total) * 100}%` }}
                                  title={`卖出 ${latest.sell}`}
                                />
                              )}
                              {latest.strongSell > 0 && (
                                <div
                                  className="bg-[#8B0000]"
                                  style={{ width: `${(latest.strongSell / total) * 100}%` }}
                                  title={`强力卖出 ${latest.strongSell}`}
                                />
                              )}
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-xs text-center">
                              <div>
                                <span className="text-[#0E6245] font-medium">{latest.strongBuy}</span>
                                <p className="text-stripe-ink-lighter">强买</p>
                              </div>
                              <div>
                                <span className="text-stripe-success font-medium">{latest.buy}</span>
                                <p className="text-stripe-ink-lighter">买入</p>
                              </div>
                              <div>
                                <span className="text-stripe-warning font-medium">{latest.hold}</span>
                                <p className="text-stripe-ink-lighter">持有</p>
                              </div>
                              <div>
                                <span className="text-stripe-danger font-medium">{latest.sell}</span>
                                <p className="text-stripe-ink-lighter">卖出</p>
                              </div>
                              <div>
                                <span className="text-[#8B0000] font-medium">{latest.strongSell}</span>
                                <p className="text-stripe-ink-lighter">强卖</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <p className="text-sm text-stripe-ink-lighter">暂无分析师评级</p>
                  )}
                </div>
              </div>

              {/* 策略建议 */}
              <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)] mb-6">
                <h3 className="font-semibold text-stripe-ink mb-4">OMEGA 策略建议</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* 长线 · THE CORE — 护城河集成 */}
                  <div className="p-4 bg-stripe-bg rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-stripe-purple" />
                      <p className="text-sm font-medium text-stripe-ink">长线 · THE CORE</p>
                    </div>
                    {moatLoading ? (
                      <p className="text-xs text-stripe-ink-lighter">加载护城河数据...</p>
                    ) : moatData ? (() => {
                      const status = moatData.status;
                      const totalScore = moatData.totalScore || 0;
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-stripe-ink">{totalScore}<span className="text-xs font-normal text-stripe-ink-lighter">/35</span></span>
                            <StatusBadge variant={status === "verified" ? "success" : status === "rejected" ? "danger" : "warning"}>
                              {status === "verified" ? "已通过" : status === "rejected" ? "已拒绝" : "待审核"}
                            </StatusBadge>
                          </div>
                          {status === "pending" && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                className="bg-stripe-success text-white hover:bg-stripe-success/90 text-xs px-3 py-1 h-7"
                                disabled={approving}
                                onClick={async () => {
                                  const result = await approve(symbol);
                                  if (result) refreshMoat();
                                }}
                              >
                                {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                <span className="ml-1">通过</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="border-stripe-border text-stripe-ink hover:bg-stripe-danger-light hover:text-stripe-danger text-xs px-3 py-1 h-7"
                                disabled={rejecting}
                                onClick={async () => {
                                  const result = await rejectMoat(symbol);
                                  if (result) refreshMoat();
                                }}
                              >
                                {rejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                <span className="ml-1">拒绝</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })() : (
                      <div className="space-y-2">
                        <p className="text-xs text-stripe-ink-lighter">
                          {moatError?.includes("暂无") ? "暂无护城河评分" : "需要护城河评分 ≥ 20 分"}
                        </p>
                        <Button
                          variant="outline"
                          className="text-xs px-3 py-1 h-7 border-stripe-purple text-stripe-purple hover:bg-stripe-purple/10"
                          disabled={proposing}
                          onClick={async () => {
                            const result = await propose(symbol);
                            if (result) refreshMoat();
                          }}
                        >
                          {proposing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          <span className="ml-1">添加到护城河评估</span>
                        </Button>
                      </div>
                    )}
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

              {/* 活跃信号 */}
              <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-stripe-purple" />
                  <h3 className="font-semibold text-stripe-ink">活跃信号</h3>
                  <span className="text-xs text-stripe-ink-lighter">({signals.length})</span>
                </div>
                {signals.length === 0 ? (
                  <p className="text-sm text-stripe-ink-lighter py-4 text-center">暂无活跃信号</p>
                ) : (
                  <div className="space-y-3">
                    {signals.map((sig) => {
                      const sigDecision = decisions[sig.id] || sig.userDecision || "pending";
                      const strategyLabel = sig.strategy === "long" ? "长线" : sig.strategy === "mid" ? "中线" : "短线";
                      const strategyColor = sig.strategy === "long" ? "text-stripe-purple" : sig.strategy === "mid" ? "text-stripe-info-text" : "text-stripe-warning";
                      const actionLabel = sig.type === "buy" ? "买入" : sig.type === "sell" ? "卖出" : sig.type === "watch" ? "观望" : "预警";
                      const actionVariant = sig.type === "buy" ? "success" : sig.type === "sell" ? "danger" : "warning";
                      return (
                        <div key={sig.id} className="flex items-center gap-4 p-3 bg-stripe-bg rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge variant={actionVariant as "success" | "danger" | "warning"}>{actionLabel}</StatusBadge>
                              <span className={`text-xs font-medium ${strategyColor}`}>{strategyLabel}</span>
                              <span className="text-xs text-stripe-ink-lighter">{sig.indicator}: {sig.indicatorValue}</span>
                            </div>
                            {sig.reason && (
                              <p className="text-xs text-stripe-ink-lighter mt-1 truncate">{sig.reason}</p>
                            )}
                          </div>
                          <div className="text-right text-sm shrink-0">
                            <p className="font-medium text-stripe-ink">${sig.price?.toFixed(2) || "N/A"}</p>
                            <p className="text-xs text-stripe-ink-lighter">
                              {sig.triggeredAt ? new Date(sig.triggeredAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {sigDecision === "confirmed" ? (
                              <StatusBadge variant="success">已确认</StatusBadge>
                            ) : sigDecision === "ignored" ? (
                              <StatusBadge variant="neutral">已忽略</StatusBadge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSignalDecision(sig.id, "confirm")}
                                  disabled={decidingId === sig.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-stripe-success-light text-[#0E6245] hover:bg-stripe-success/20 transition-colors disabled:opacity-50"
                                >
                                  {decidingId === sig.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  确认
                                </button>
                                <button
                                  onClick={() => handleSignalDecision(sig.id, "ignore")}
                                  disabled={decidingId === sig.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-stripe-bg text-stripe-ink-lighter hover:bg-stripe-border transition-colors disabled:opacity-50"
                                >
                                  {decidingId === sig.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                  忽略
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </MainContent>
    </div>
  );
}
