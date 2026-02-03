/**
 * Yahoo Finance 数据获取服务
 * 使用多种方式获取实时行情和历史数据
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

// Yahoo Finance API URL - 使用 v7 版本更稳定
const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

/**
 * 获取实时报价
 */
export async function getYahooQuote(symbols: string[]): Promise<YahooQuote[]> {
  const symbolsStr = symbols.join(",");
  
  // 尝试多个 API 端点
  const urls = [
    `${YAHOO_QUOTE_URL}?symbols=${symbolsStr}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Yahoo Finance API returned ${response.status} for ${url}`);
        continue;
      }

      const data = await response.json();
      const results = data.quoteResponse?.result;
      
      if (results && results.length > 0) {
        return results;
      }
    } catch (error) {
      console.warn(`Yahoo Finance request failed for ${url}:`, error);
      continue;
    }
  }

  console.error("All Yahoo Finance endpoints failed");
  return [];
}

/**
 * 获取历史数据
 */
export async function getYahooHistory(
  symbol: string,
  range = "6mo",
  interval = "1d"
): Promise<YahooHistoricalData[]> {
  const urls = [
    `${YAHOO_CHART_URL}/${symbol}?range=${range}&interval=${interval}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Yahoo chart API returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];

      if (!result) continue;

      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

      if (timestamps.length === 0) continue;

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
      console.warn(`Yahoo chart request failed:`, error);
      continue;
    }
  }

  return [];
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

  const validHistory = history.filter(h => h.close > 0);
  if (validHistory.length < 2) {
    return { rsRating: 50, return6m: 0, return3m: 0, return1m: 0 };
  }

  const latestPrice = validHistory[validHistory.length - 1].close;
  const price6mAgo = validHistory[0].close;
  const price3mAgo = validHistory[Math.floor(validHistory.length / 2)]?.close || price6mAgo;
  const price1mAgo = validHistory[Math.max(0, validHistory.length - 22)]?.close || latestPrice;

  const return6m = ((latestPrice - price6mAgo) / price6mAgo) * 100;
  const return3m = ((latestPrice - price3mAgo) / price3mAgo) * 100;
  const return1m = ((latestPrice - price1mAgo) / price1mAgo) * 100;

  // 简化版 RS 计算
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

  const closes = history.map((h) => h.close).filter(c => c > 0);
  if (closes.length < period + 1) {
    return { rsi: 50, signal: "neutral" };
  }

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
  const validCloses = closes.filter(c => c > 0);
  if (validCloses.length < period) return null;

  const recentCloses = validCloses.slice(-period);
  const middle = recentCloses.reduce((a, b) => a + b, 0) / period;
  
  const squaredDiffs = recentCloses.map((c) => Math.pow(c - middle, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;

  const currentPrice = validCloses[validCloses.length - 1];
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
    name: quote.shortName || quote.longName || symbol,
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

// 模拟数据（当 API 不可用时使用）
export function getMockMarketIndices() {
  return {
    sp500: {
      symbol: "^GSPC",
      shortName: "S&P 500",
      longName: "S&P 500",
      regularMarketPrice: 5234.18,
      regularMarketChange: 64.32,
      regularMarketChangePercent: 1.24,
      regularMarketVolume: 2500000000,
      regularMarketPreviousClose: 5169.86,
      regularMarketOpen: 5175.00,
      regularMarketDayHigh: 5245.00,
      regularMarketDayLow: 5165.00,
      fiftyTwoWeekHigh: 5400.00,
      fiftyTwoWeekLow: 4200.00,
      marketCap: 0,
      trailingPE: 0,
      forwardPE: 0,
      priceToBook: 0,
      dividendYield: 0,
    },
    vix: {
      symbol: "^VIX",
      shortName: "VIX",
      longName: "CBOE Volatility Index",
      regularMarketPrice: 14.32,
      regularMarketChange: -0.31,
      regularMarketChangePercent: -2.15,
      regularMarketVolume: 0,
      regularMarketPreviousClose: 14.63,
      regularMarketOpen: 14.50,
      regularMarketDayHigh: 15.00,
      regularMarketDayLow: 14.00,
      fiftyTwoWeekHigh: 35.00,
      fiftyTwoWeekLow: 12.00,
      marketCap: 0,
      trailingPE: 0,
      forwardPE: 0,
      priceToBook: 0,
      dividendYield: 0,
    },
    nasdaq: null,
    dow: null,
  };
}
