/**
 * Alpha Vantage 技术指标服务
 * 用于获取 RSI, MACD, 布林带等技术指标
 * 
 * 免费限制: 25 次/天, 5 次/分钟
 * 需要 API Key: https://www.alphavantage.co/support/#api-key
 */

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

interface AlphaVantageRSI {
  date: string;
  rsi: number;
}

interface AlphaVantageMACD {
  date: string;
  macd: number;
  macdSignal: number;
  macdHist: number;
}

interface AlphaVantageBBands {
  date: string;
  upper: number;
  middle: number;
  lower: number;
}

interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  eps: number;
  roe: number;
  profitMargin: number;
  operatingMargin: number;
  revenueGrowth: number;
  earningsGrowth: number;
}

/**
 * 获取 RSI 指标
 */
export async function getAlphaRSI(
  symbol: string,
  interval = "daily",
  timePeriod = 14,
  apiKey?: string
): Promise<AlphaVantageRSI[]> {
  const key = apiKey || process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) {
    console.warn("Alpha Vantage API key not configured");
    return [];
  }

  const url = `${ALPHA_VANTAGE_BASE}?function=RSI&symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&series_type=close&apikey=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data["Note"] || data["Error Message"]) {
      console.error("Alpha Vantage error:", data["Note"] || data["Error Message"]);
      return [];
    }

    const rsiData = data[`Technical Analysis: RSI`];
    if (!rsiData) return [];

    return Object.entries(rsiData)
      .slice(0, 30)
      .map(([date, values]: [string, any]) => ({
        date,
        rsi: parseFloat(values["RSI"]),
      }));
  } catch (error) {
    console.error("Failed to fetch RSI:", error);
    return [];
  }
}

/**
 * 获取 MACD 指标
 */
export async function getAlphaMACD(
  symbol: string,
  interval = "daily",
  apiKey?: string
): Promise<AlphaVantageMACD[]> {
  const key = apiKey || process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return [];

  const url = `${ALPHA_VANTAGE_BASE}?function=MACD&symbol=${symbol}&interval=${interval}&series_type=close&apikey=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data["Note"] || data["Error Message"]) return [];

    const macdData = data[`Technical Analysis: MACD`];
    if (!macdData) return [];

    return Object.entries(macdData)
      .slice(0, 30)
      .map(([date, values]: [string, any]) => ({
        date,
        macd: parseFloat(values["MACD"]),
        macdSignal: parseFloat(values["MACD_Signal"]),
        macdHist: parseFloat(values["MACD_Hist"]),
      }));
  } catch (error) {
    console.error("Failed to fetch MACD:", error);
    return [];
  }
}

/**
 * 获取布林带指标
 */
export async function getAlphaBBands(
  symbol: string,
  interval = "daily",
  timePeriod = 20,
  apiKey?: string
): Promise<AlphaVantageBBands[]> {
  const key = apiKey || process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return [];

  const url = `${ALPHA_VANTAGE_BASE}?function=BBANDS&symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&series_type=close&apikey=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data["Note"] || data["Error Message"]) return [];

    const bbandsData = data[`Technical Analysis: BBANDS`];
    if (!bbandsData) return [];

    return Object.entries(bbandsData)
      .slice(0, 30)
      .map(([date, values]: [string, any]) => ({
        date,
        upper: parseFloat(values["Real Upper Band"]),
        middle: parseFloat(values["Real Middle Band"]),
        lower: parseFloat(values["Real Lower Band"]),
      }));
  } catch (error) {
    console.error("Failed to fetch BBands:", error);
    return [];
  }
}

/**
 * 获取公司概览数据 (用于护城河分析)
 */
export async function getCompanyOverview(
  symbol: string,
  apiKey?: string
): Promise<CompanyOverview | null> {
  const key = apiKey || process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return null;

  const url = `${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data["Note"] || data["Error Message"] || !data["Symbol"]) return null;

    return {
      symbol: data["Symbol"],
      name: data["Name"],
      description: data["Description"],
      sector: data["Sector"],
      industry: data["Industry"],
      marketCap: parseFloat(data["MarketCapitalization"]) || 0,
      peRatio: parseFloat(data["PERatio"]) || 0,
      pbRatio: parseFloat(data["PriceToBookRatio"]) || 0,
      dividendYield: parseFloat(data["DividendYield"]) || 0,
      eps: parseFloat(data["EPS"]) || 0,
      roe: parseFloat(data["ReturnOnEquityTTM"]) || 0,
      profitMargin: parseFloat(data["ProfitMargin"]) || 0,
      operatingMargin: parseFloat(data["OperatingMarginTTM"]) || 0,
      revenueGrowth: parseFloat(data["QuarterlyRevenueGrowthYOY"]) || 0,
      earningsGrowth: parseFloat(data["QuarterlyEarningsGrowthYOY"]) || 0,
    };
  } catch (error) {
    console.error("Failed to fetch company overview:", error);
    return null;
  }
}

/**
 * 获取完整技术分析数据
 */
export async function getFullTechnicalAnalysis(
  symbol: string,
  apiKey?: string
): Promise<{
  rsi: AlphaVantageRSI | null;
  macd: AlphaVantageMACD | null;
  bbands: AlphaVantageBBands | null;
  signals: {
    rsiSignal: "买入" | "持有" | "卖出";
    macdSignal: "看涨" | "中性" | "看跌";
    bbandsSignal: "超卖" | "中性" | "超买";
  };
}> {
  const [rsiData, macdData, bbandsData] = await Promise.all([
    getAlphaRSI(symbol, "daily", 14, apiKey),
    getAlphaMACD(symbol, "daily", apiKey),
    getAlphaBBands(symbol, "daily", 20, apiKey),
  ]);

  const rsi = rsiData[0] || null;
  const macd = macdData[0] || null;
  const bbands = bbandsData[0] || null;

  // 生成信号
  let rsiSignal: "买入" | "持有" | "卖出" = "持有";
  if (rsi && rsi.rsi < 30) rsiSignal = "买入";
  else if (rsi && rsi.rsi > 70) rsiSignal = "卖出";

  let macdSignal: "看涨" | "中性" | "看跌" = "中性";
  if (macd && macd.macdHist > 0) macdSignal = "看涨";
  else if (macd && macd.macdHist < 0) macdSignal = "看跌";

  let bbandsSignal: "超卖" | "中性" | "超买" = "中性";
  // 需要当前价格来判断布林带位置

  return {
    rsi,
    macd,
    bbands,
    signals: { rsiSignal, macdSignal, bbandsSignal },
  };
}
