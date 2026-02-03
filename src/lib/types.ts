/**
 * OMEGA 数据类型定义
 * 三层策略系统的核心数据结构
 */

// ============ 市场数据 ============
export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

export interface VIXData {
  value: number;
  change: number;
  changePercent: number;
  level: "low" | "moderate" | "high" | "extreme";
  updatedAt: string;
}

export interface CircuitBreaker {
  status: "off" | "level1" | "level2" | "level3";
  reason?: string;
  triggeredAt?: string;
}

// ============ 长线 THE CORE - 护城河 ============
export interface MoatPower {
  name: string;
  nameEn: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MoatAnalysis {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  
  // 护城河评分
  totalScore: number;
  maxScore: number;
  
  // 五大护城河力量
  powers: {
    switchingCosts: MoatPower;     // 转换成本
    networkEffects: MoatPower;     // 网络效应
    intangibleAssets: MoatPower;   // 无形资产
    costAdvantages: MoatPower;     // 成本优势
    efficientScale: MoatPower;     // 有效规模
  };
  
  // AI 分析
  aiSummary: string;
  confidence: "high" | "medium" | "low";
  
  // 审批状态
  status: "pending" | "verified" | "rejected";
  analyzedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ============ 中线 THE FLOW - 动量 ============
export interface MomentumData {
  ticker: string;
  name: string;
  
  // IBD 相对强度
  rsRating: number;           // 1-99
  rsRatingChange: number;     // 周变化
  
  // 动量指标
  momentum: {
    week1: number;
    month1: number;
    month3: number;
    month6: number;
    year1: number;
  };
  
  // 成交量
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  
  // 机构持仓
  institutionalOwnership: number;
  institutionalChange: number;
  
  // 信号
  signal: "buy" | "hold" | "sell" | "watch";
  signalStrength: number;
  updatedAt: string;
}

// ============ 短线 THE SWING - 情绪 ============
export interface TechnicalData {
  ticker: string;
  name: string;
  price: number;
  
  // RSI
  rsi: number;
  rsiSignal: "oversold" | "neutral" | "overbought";
  
  // 布林带
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  bollingerPosition: "above" | "middle" | "below";
  
  // MACD
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  
  // 市场情绪
  fearGreedIndex?: number;
  putCallRatio?: number;
  
  // 信号
  signal: "buy" | "hold" | "sell" | "alert";
  signalReason: string;
  updatedAt: string;
}

// ============ 持仓管理 ============
export interface Position {
  id: string;
  ticker: string;
  name: string;
  strategy: "long" | "mid" | "short";
  
  // 持仓信息
  shares: number;
  avgCost: number;
  currentPrice: number;
  
  // 计算字段
  value: number;
  gain: number;
  gainPercent: number;
  weight: number;
  
  // 策略指标
  moatScore?: number;     // 长线
  rsRating?: number;      // 中线
  rsi?: number;           // 短线
  
  // 元数据
  entryDate: string;
  lastUpdated: string;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  cash: number;
  
  // 策略分配
  allocation: {
    long: { target: number; actual: number };
    mid: { target: number; actual: number };
    short: { target: number; actual: number };
  };
  
  positions: Position[];
  updatedAt: string;
}

// ============ 交易信号 ============
export interface TradingSignal {
  id: string;
  ticker: string;
  name: string;
  
  type: "buy" | "sell" | "watch" | "alert";
  strategy: "long" | "mid" | "short";
  
  // 信号详情
  indicator: string;
  indicatorValue: string;
  reason: string;
  
  // 价格信息
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  
  // 时间
  triggeredAt: string;
  expiresAt?: string;
  
  // 状态
  status: "active" | "executed" | "expired" | "cancelled";
}

// ============ API 响应 ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============ 数据源配置 ============
export interface DataSource {
  name: string;
  type: "free" | "freemium" | "paid";
  apiUrl: string;
  rateLimit: string;
  features: string[];
  pricing?: string;
}
