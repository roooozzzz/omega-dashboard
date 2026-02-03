/**
 * Yahoo Finance 数据获取服务
 * 使用非官方 API 获取实时行情和历史数据
 */

interface YahooQuote {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
  trailingPE: number;
  forwardPE: number;
  priceToBook: number;
  dividendYield: number;
}

interface YahooHistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

// Yahoo Finance API 基础 URL
const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

/**
 * 获取实时报价
 */
export async function getYahooQuote(symbols: string[]): Promise<YahooQuote[]> {
  const symbolsStr = symbols.join(",");
  const url = `${YAHOO_BASE_URL}/quote?symbols=${symbolsStr}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error("Failed to fetch Yahoo quote:", error);
    return [];
  }
}

/**
 * 获取历史数据
 * @param symbol 股票代码
 * @param range 时间范围: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
 * @param interval 数据间隔: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
 */
export async function getYahooHistory(
  symbol: string,
  range = "6mo",
  interval = "1d"
): Promise<YahooHistoricalData[]> {
  const url = `${YAHOO_CHART_URL}/${symbol}?range=${range}&interval=${interval}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return [];

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000),
      open: quotes.open?.[i] || 0,
      high: quotes.high?.[i] || 0,
      low: quotes.low?.[i] || 0,
      close: quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0,
      adjClose: adjClose[i] || quotes.close?.[i] || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch Yahoo history:", error);
    return [];
  }
}

/**
 * 计算 RS 评级 (基于 6 个月收益率)
 */
export async function calculateRSRating(symbol: string): Promise<{
  rsRating: number;
  return6m: number;
  return3m: number;
  return1m: number;
}> {
  const history = await getYahooHistory(symbol, "6mo", "1d");

  if (history.length < 2) {
    return { rsRating: 50, return6m: 0, return3m: 0, return1m: 0 };
  }

  const latestPrice = history[history.length - 1].close;
  const price6mAgo = history[0].close;
  const price3mAgo = history[Math.floor(history.length / 2)]?.close || price6mAgo;
  const price1mAgo = history[Math.max(0, history.length - 22)]?.close || latestPrice;

  const return6m = ((latestPrice - price6mAgo) / price6mAgo) * 100;
  const return3m = ((latestPrice - price3mAgo) / price3mAgo) * 100;
  const return1m = ((latestPrice - price1mAgo) / price1mAgo) * 100;

  // 简化版 RS 计算：将 6 个月收益率映射到 1-99
  // 实际 IBD RS 需要与全市场股票比较
  // 这里假设正收益 > 50, 负收益 < 50
  let rsRating = 50 + return6m;
  rsRating = Math.min(99, Math.max(1, Math.round(rsRating)));

  return { rsRating, return6m, return3m, return1m };
}

/**
 * 计算 RSI
 */
export async function calculateRSI(
  symbol: string,
  period = 14
): Promise<{ rsi: number; signal: "oversold" | "neutral" | "overbought" }> {
  const history = await getYahooHistory(symbol, "3mo", "1d");

  if (history.length < period + 1) {
    return { rsi: 50, signal: "neutral" };
  }

  const closes = history.map((h) => h.close);
  const recentCloses = closes.slice(-period - 1);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < recentCloses.length; i++) {
    const change = recentCloses[i] - recentCloses[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  let signal: "oversold" | "neutral" | "overbought" = "neutral";
  if (rsi < 30) signal = "oversold";
  else if (rsi > 70) signal = "overbought";

  return { rsi: Math.round(rsi * 100) / 100, signal };
}

/**
 * 计算布林带
 */
export function calculateBollingerBands(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2
): { upper: number; middle: number; lower: number; position: "above" | "middle" | "below" } | null {
  if (closes.length < period) return null;

  const recentCloses = closes.slice(-period);
  const middle = recentCloses.reduce((a, b) => a + b, 0) / period;
  
  const squaredDiffs = recentCloses.map((c) => Math.pow(c - middle, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;

  const currentPrice = closes[closes.length - 1];
  let position: "above" | "middle" | "below" = "middle";
  if (currentPrice > upper) position = "above";
  else if (currentPrice < lower) position = "below";

  return { upper, middle, lower, position };
}

/**
 * 获取市场指数
 */
export async function getMarketIndices(): Promise<{
  sp500: YahooQuote | null;
  nasdaq: YahooQuote | null;
  dow: YahooQuote | null;
  vix: YahooQuote | null;
}> {
  const quotes = await getYahooQuote(["^GSPC", "^IXIC", "^DJI", "^VIX"]);

  return {
    sp500: quotes.find((q) => q.symbol === "^GSPC") || null,
    nasdaq: quotes.find((q) => q.symbol === "^IXIC") || null,
    dow: quotes.find((q) => q.symbol === "^DJI") || null,
    vix: quotes.find((q) => q.symbol === "^VIX") || null,
  };
}

/**
 * 获取股票完整数据（价格 + 技术指标）
 */
export async function getStockFullData(symbol: string) {
  const [quotes, rsData, rsiData] = await Promise.all([
    getYahooQuote([symbol]),
    calculateRSRating(symbol),
    calculateRSI(symbol),
  ]);

  const quote = quotes[0];
  if (!quote) return null;

  const history = await getYahooHistory(symbol, "3mo", "1d");
  const closes = history.map((h) => h.close);
  const bollinger = calculateBollingerBands(closes);

  return {
    // 基础信息
    symbol: quote.symbol,
    name: quote.shortName || quote.longName,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    volume: quote.regularMarketVolume,
    marketCap: quote.marketCap,
    
    // 估值
    pe: quote.trailingPE,
    forwardPE: quote.forwardPE,
    priceToBook: quote.priceToBook,
    
    // 技术指标
    rsRating: rsData.rsRating,
    return6m: rsData.return6m,
    return3m: rsData.return3m,
    return1m: rsData.return1m,
    
    rsi: rsiData.rsi,
    rsiSignal: rsiData.signal,
    
    bollinger,
    
    updatedAt: new Date().toISOString(),
  };
}
