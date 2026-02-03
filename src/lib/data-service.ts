/**
 * OMEGA 数据服务
 * 负责获取和处理三层策略所需的市场数据
 */

import type {
  MarketIndex,
  VIXData,
  MoatAnalysis,
  MomentumData,
  TechnicalData,
  TradingSignal,
  Portfolio,
} from "./types";

// ============ 数据源配置 ============
const DATA_SOURCES = {
  // 免费数据源
  yahooFinance: {
    name: "Yahoo Finance",
    baseUrl: "https://query1.finance.yahoo.com",
    features: ["价格", "历史数据", "基本面"],
  },
  alphaVantage: {
    name: "Alpha Vantage",
    baseUrl: "https://www.alphavantage.co",
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    features: ["技术指标", "基本面", "外汇"],
  },
  finnhub: {
    name: "Finnhub",
    baseUrl: "https://finnhub.io/api/v1",
    apiKey: process.env.FINNHUB_API_KEY,
    features: ["实时价格", "新闻", "机构持仓"],
  },
  fmp: {
    name: "Financial Modeling Prep",
    baseUrl: "https://financialmodelingprep.com/api/v3",
    apiKey: process.env.FMP_API_KEY,
    features: ["财务报表", "比率", "估值"],
  },
};

// ============ 市场数据 ============

/**
 * 获取主要市场指数
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  // TODO: 集成真实 API
  // 使用 Yahoo Finance 获取 SPY, QQQ, DIA 等
  return [
    {
      symbol: "SPX",
      name: "标普500",
      value: 5234.18,
      change: 64.32,
      changePercent: 1.24,
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: "VIX",
      name: "恐慌指数",
      value: 14.32,
      change: -0.31,
      changePercent: -2.15,
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * 获取 VIX 数据和解读
 */
export async function getVIXData(): Promise<VIXData> {
  // VIX 等级判断
  // < 15: 低波动
  // 15-20: 适中
  // 20-30: 高波动
  // > 30: 极端恐慌
  const value = 14.32;
  let level: VIXData["level"] = "low";
  if (value >= 30) level = "extreme";
  else if (value >= 20) level = "high";
  else if (value >= 15) level = "moderate";

  return {
    value,
    change: -0.31,
    changePercent: -2.15,
    level,
    updatedAt: new Date().toISOString(),
  };
}

// ============ 长线 THE CORE ============

/**
 * 获取护城河分析列表
 * 数据来源: 
 * - Morningstar 护城河评级
 * - 财务比率 (ROE, ROIC, 毛利率)
 * - 竞争优势分析
 */
export async function getMoatAnalysisList(): Promise<MoatAnalysis[]> {
  // TODO: 集成 Morningstar API 或 FMP
  // 护城河评分算法:
  // 1. 转换成本 (0-7): 客户替换产品的难度
  // 2. 网络效应 (0-7): 用户越多价值越高
  // 3. 无形资产 (0-7): 品牌、专利、许可证
  // 4. 成本优势 (0-7): 规模经济、独特资源
  // 5. 有效规模 (0-7): 市场容量有限，新进入者无利可图
  
  return []; // 返回 demo 数据在组件中
}

// ============ 中线 THE FLOW ============

/**
 * 获取动量数据
 * 数据来源:
 * - RS 评级: IBD 或自建模型
 * - 动量指标: 各周期收益率
 * - 机构持仓: 13F 文件分析
 */
export async function getMomentumData(ticker: string): Promise<MomentumData | null> {
  // TODO: 集成真实 API
  // RS 评级计算方法:
  // 1. 计算股票 6 个月收益率
  // 2. 与全市场股票比较
  // 3. 排名百分位 (1-99)
  // 90+ 为领导者, 70-89 良好, <70 落后
  
  return null;
}

/**
 * 获取 RS 评级排行榜
 */
export async function getRSLeaderboard(limit = 20): Promise<MomentumData[]> {
  // TODO: 计算全市场 RS 评级并排序
  return [];
}

// ============ 短线 THE SWING ============

/**
 * 获取技术分析数据
 * 数据来源:
 * - RSI: Alpha Vantage 技术指标 API
 * - 布林带: 自建计算
 * - MACD: Alpha Vantage 或自建
 */
export async function getTechnicalData(ticker: string): Promise<TechnicalData | null> {
  // TODO: 集成 Alpha Vantage 技术指标
  // RSI 信号判断:
  // < 30: 超卖 (买入机会)
  // 30-70: 中性
  // > 70: 超买 (卖出信号)
  
  return null;
}

/**
 * 获取市场情绪指标
 */
export async function getMarketSentiment(): Promise<{
  fearGreedIndex: number;
  fearGreedLevel: string;
  putCallRatio: number;
}> {
  // Fear & Greed Index (CNN)
  // 0-25: 极度恐惧
  // 25-45: 恐惧
  // 45-55: 中性
  // 55-75: 贪婪
  // 75-100: 极度贪婪
  
  return {
    fearGreedIndex: 62,
    fearGreedLevel: "贪婪",
    putCallRatio: 0.85,
  };
}

// ============ 信号生成 ============

/**
 * 生成交易信号
 * 根据三层策略的触发条件生成信号
 */
export async function generateSignals(): Promise<TradingSignal[]> {
  // 信号触发条件:
  // 长线: 护城河评分 > 20 且通过人工审核
  // 中线: RS > 85 且处于上升趋势
  // 短线: RSI < 30 (超卖买入) 或 > 70 (超买卖出)
  
  return [];
}

// ============ 实时数据 ============

/**
 * 获取实时价格
 */
export async function getRealtimePrice(ticker: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
} | null> {
  // TODO: 使用 WebSocket 或轮询获取实时数据
  // 免费选项: Finnhub WebSocket, Alpha Vantage
  // 付费选项: Polygon.io, IEX Cloud
  
  return null;
}

// ============ 辅助函数 ============

/**
 * 计算 RS 评级
 * 基于 IBD 方法的简化版
 */
export function calculateRSRating(
  returns6m: number,
  marketReturns: number[]
): number {
  const betterThanCount = marketReturns.filter((r) => returns6m > r).length;
  const percentile = (betterThanCount / marketReturns.length) * 100;
  return Math.min(99, Math.max(1, Math.round(percentile)));
}

/**
 * 计算 RSI
 */
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * 判断护城河等级
 */
export function getMoatGrade(score: number, maxScore: number): string {
  const percent = score / maxScore;
  if (percent >= 0.8) return "宽护城河";
  if (percent >= 0.6) return "窄护城河";
  return "无护城河";
}
