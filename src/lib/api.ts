/**
 * OMEGA API 客户端
 * 封装所有 FastAPI 后端调用
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * 通用请求方法
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || `HTTP ${response.status}`,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) throw error;

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError(408, "请求超时");
      }
      throw new ApiError(0, error.message || "网络错误");
    }

    throw new ApiError(0, "未知错误");
  }
}

// ============ 市场数据 ============
export interface MarketDataResponse {
  spx: IndexData;
  ndx: IndexData;
  vix: IndexData;
  ma200: number;
  ndxMa200: number;
  circuitBreaker: boolean;
  circuitBreakerReasons: string[];
  updatedAt: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  status: "normal" | "warning" | "danger";
}

// ============ Finnhub 数据 ============
export interface FinnhubQuote {
  symbol: string;
  current: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface NewsSentiment {
  symbol: string;
  buzzArticles: number;
  buzzWeeklyAvg: number;
  sentimentScore: number;
  bullishPercent: number;
  bearishPercent: number;
  sectorAvgBullish: number;
  sectorAvgScore: number;
}

export interface AnalystRecommendation {
  symbol: string;
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export const marketApi = {
  getData: () => request<MarketDataResponse>("/api/market"),
  getQuote: (symbol: string) =>
    request<FinnhubQuote>(`/api/market/quote/${encodeURIComponent(symbol)}`),
  getSentiment: (symbol: string) =>
    request<NewsSentiment | null>(`/api/market/sentiment/${encodeURIComponent(symbol)}`),
  getRecommendation: (symbol: string) =>
    request<AnalystRecommendation[]>(`/api/market/recommendation/${encodeURIComponent(symbol)}`),
};

// ============ 股票数据 ============
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  forwardPE: number;
  priceToBook: number;
  rsRating: number;
  return6m: number;
  return3m: number;
  return1m: number;
  rsi: number;
  rsiSignal: "oversold" | "neutral" | "overbought";
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    position: "above" | "middle" | "below";
  } | null;
  updatedAt: string;
}

/** 后端 StockDetail 的原始结构 */
interface StockDetailRaw {
  quote: {
    symbol: string;
    name: string | null;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number | null;
    peRatio: number | null;
    grossMargin: number | null;
    returnOnEquity: number | null;
    revenueGrowth: number | null;
    profitMargin: number | null;
  };
  history: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
  indicators: {
    rsi2: number | null;
    rsi14: number | null;
    rsRating: number | null;
    bbUpper: number | null;
    bbLower: number | null;
    bbMiddle: number | null;
    ma50: number | null;
    ma200: number | null;
  };
}

function mapStockDetail(raw: StockDetailRaw): StockData {
  const q = raw.quote;
  const ind = raw.indicators;

  // 计算布林带位置
  let bollinger: StockData["bollinger"] = null;
  if (ind.bbUpper != null && ind.bbLower != null && ind.bbMiddle != null) {
    const position =
      q.price >= ind.bbUpper ? "above" as const
        : q.price <= ind.bbLower ? "below" as const
          : "middle" as const;
    bollinger = { upper: ind.bbUpper, middle: ind.bbMiddle, lower: ind.bbLower, position };
  }

  // RSI 信号判断
  const rsi14 = ind.rsi14 ?? 50;
  const rsiSignal: StockData["rsiSignal"] =
    rsi14 < 30 ? "oversold" : rsi14 > 70 ? "overbought" : "neutral";

  return {
    symbol: q.symbol,
    name: q.name ?? q.symbol,
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
    volume: q.volume,
    marketCap: q.marketCap ?? 0,
    pe: q.peRatio ?? 0,
    forwardPE: 0,
    priceToBook: 0,
    rsRating: ind.rsRating ?? 0,
    return6m: 0,
    return3m: 0,
    return1m: 0,
    rsi: rsi14,
    rsiSignal,
    bollinger,
    updatedAt: new Date().toISOString(),
  };
}

export const stockApi = {
  getStock: async (symbol: string): Promise<StockData> => {
    const raw = await request<StockDetailRaw>(`/api/stock/${encodeURIComponent(symbol)}`);
    return mapStockDetail(raw);
  },
};

// ============ 护城河数据 ============
export interface MoatPower {
  name: string;
  nameEn: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MoatData {
  ticker: string;
  name: string;
  sector: string;
  totalScore: number;
  maxScore: number;
  status: "pending" | "verified" | "rejected";
  powers: {
    scaleEconomies: MoatPower;
    networkEffects: MoatPower;
    counterPositioning: MoatPower;
    switchingCosts: MoatPower;
    branding: MoatPower;
    corneredResource: MoatPower;
    processPower: MoatPower;
  };
  aiSummary?: string;
  source?: string;
  analyzedAt: string;
  reviewedAt?: string;
}

export interface MoatListResponse {
  moats: MoatData[];
  total: number;
}

export interface StrongBuysResponse {
  strongBuys: MoatData[];
  count: number;
}

/** 后端 MoatProposal 的原始结构 (CamelModel 序列化后) */
interface MoatProposalRaw {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  scores: {
    scaleEconomies: number;
    networkEffects: number;
    counterPositioning: number;
    switchingCosts: number;
    branding: number;
    corneredResource: number;
    processPower: number;
  };
  totalScore: number;
  topPower: string;
  confidence: "High" | "Medium" | "Low";
  analysisSummary: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  source: string | null;
}

/** 7 Powers 元数据：中文名、英文键名、满分 */
const POWER_META: Record<string, { name: string; nameEn: string; maxScore: number }> = {
  scaleEconomies:     { name: "规模经济",   nameEn: "Scale Economies",     maxScore: 5 },
  networkEffects:     { name: "网络效应",   nameEn: "Network Effects",     maxScore: 5 },
  counterPositioning: { name: "差异化定位", nameEn: "Counter Positioning", maxScore: 5 },
  switchingCosts:     { name: "转换成本",   nameEn: "Switching Costs",     maxScore: 5 },
  branding:           { name: "品牌",       nameEn: "Branding",            maxScore: 5 },
  corneredResource:   { name: "稀缺资源",   nameEn: "Cornered Resource",   maxScore: 5 },
  processPower:       { name: "流程优势",   nameEn: "Process Power",       maxScore: 5 },
};

function mapMoatProposal(raw: MoatProposalRaw): MoatData {
  const powers = {} as MoatData["powers"];
  for (const [key, meta] of Object.entries(POWER_META)) {
    const score = (raw.scores as Record<string, number>)[key] ?? 0;
    (powers as Record<string, MoatPower>)[key] = {
      name: meta.name,
      nameEn: meta.nameEn,
      score,
      maxScore: meta.maxScore,
      description: score >= 4 ? "强" : score >= 2 ? "中等" : "弱",
    };
  }

  return {
    ticker: raw.ticker,
    name: raw.name,
    sector: raw.sector ?? "",
    totalScore: raw.totalScore,
    maxScore: 35, // 7 powers × 5 max
    status: raw.status.toLowerCase() as MoatData["status"],
    powers,
    aiSummary: raw.analysisSummary,
    source: raw.source ?? undefined,
    analyzedAt: raw.createdAt,
    reviewedAt: raw.reviewedAt ?? undefined,
  };
}

export const moatApi = {
  getAll: async (): Promise<MoatListResponse> => {
    const raw = await request<{ moats: MoatProposalRaw[]; total: number }>("/api/moat");
    return {
      moats: (raw.moats || []).map(mapMoatProposal),
      total: raw.total,
    };
  },

  getByTicker: async (ticker: string): Promise<MoatData> => {
    const raw = await request<MoatProposalRaw>(`/api/moat/${encodeURIComponent(ticker)}`);
    return mapMoatProposal(raw);
  },

  // Fix [中]: 后端返回 "total"，前端期望 "count" — 映射适配
  getStrongBuys: async (): Promise<StrongBuysResponse> => {
    const raw = await request<{ strongBuys: MoatProposalRaw[]; total: number }>("/api/moat/strong-buys");
    return {
      strongBuys: (raw.strongBuys || []).map(mapMoatProposal),
      count: raw.total,
    };
  },

  propose: async (ticker: string): Promise<MoatData> => {
    const raw = await request<MoatProposalRaw>("/api/moat", {
      method: "POST",
      body: JSON.stringify({ ticker }),
    });
    return mapMoatProposal(raw);
  },

  approve: async (ticker: string, adjustedScores?: Record<string, number>): Promise<MoatData> => {
    const raw = await request<MoatProposalRaw>(`/api/moat/${encodeURIComponent(ticker)}/approve`, {
      method: "POST",
      body: JSON.stringify(
        adjustedScores ? { adjustedScores } : {}
      ),
    });
    return mapMoatProposal(raw);
  },

  // Fix [中]: 后端期望 JSON body { notes }, 前端之前发 { reason }
  reject: (ticker: string, reason?: string) =>
    request<{ message: string }>(
      `/api/moat/${encodeURIComponent(ticker)}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ notes: reason }),
      }
    ),

  update: async (ticker: string, data: Partial<MoatData>): Promise<MoatData> => {
    const raw = await request<MoatProposalRaw>(`/api/moat/${encodeURIComponent(ticker)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return mapMoatProposal(raw);
  },
};

// ============ 交易信号 ============
export interface TradingSignal {
  id: string;
  ticker: string;
  name: string;
  type: "buy" | "sell" | "watch" | "alert";
  strategy: "index" | "long" | "mid" | "short";
  indicator: string;
  indicatorValue: string;
  reason: string;
  reasons: string[];
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  triggeredAt: string;
  expiresAt?: string;
  status: "active" | "executed" | "expired" | "cancelled";
  // 用户决策
  userDecision?: "confirmed" | "ignored" | "pending";
  userDecisionAt?: string;
  userNotes?: string;
}

export interface SignalStats {
  total: number;
  active: number;
  byStrategy: {
    index: number;
    long: number;
    mid: number;
    short: number;
  };
  byType: {
    buy: number;
    sell: number;
    watch: number;
    alert: number;
  };
  byDecision?: {
    confirmed: number;
    ignored: number;
    pending: number;
  };
}

export interface SignalsListResponse {
  signals: TradingSignal[];
  total: number;
  stats?: SignalStats;
}

export interface SignalStatsResponse {
  stats: SignalStats;
}

export interface SignalFilters {
  limit?: number;
  strategy?: "index" | "long" | "mid" | "short";
  ticker?: string;
  action?: string;
  status?: "active" | "executed" | "expired" | "cancelled";
}

export interface ScannerStatus {
  status: "idle" | "scanning" | "done" | "error";
  progress: number;
  phase: string;
  lastScanAt: string | null;
  totalSignals: number;
  running: boolean;
  intervalSeconds: number;
  error: string | null;
}

/** 后端 TradingSignal 的原始结构 (CamelModel 序列化后) */
interface TradingSignalRaw {
  id: string;
  ticker: string;
  name: string | null;
  strategy: "index" | "long" | "mid" | "short";
  signalType: string;
  score: number;
  triggeredAt: string;
  reasons: string[];
  action: "BUY" | "SELL" | "HOLD" | "WATCH";
  suggestedPosition: number;
  price: number | null;
  changePercent: number | null;
  userDecision: "confirmed" | "ignored" | null;
  userDecisionAt: string | null;
  userNotes: string | null;
}

/** 后端 SignalStats 的原始结构 */
interface SignalStatsRaw {
  total: number;
  today: number;
  byStrategy: Record<string, number>;
  byAction: Record<string, number>;
  byDecision: Record<string, number>;
  subscribers: number;
}

/** 后端 SignalsResponse 的原始结构 */
interface SignalsResponseRaw {
  signals: TradingSignalRaw[];
  stats: SignalStatsRaw;
  page: number;
  pageSize: number;
  total: number;
}

const ACTION_TO_TYPE: Record<string, TradingSignal["type"]> = {
  BUY: "buy",
  SELL: "sell",
  HOLD: "watch",
  WATCH: "alert",
};

function mapTradingSignal(raw: TradingSignalRaw): TradingSignal {
  // 保留原始 reasons 数组，便于前端分行展示
  const reasons = raw.reasons.length > 0 ? raw.reasons : [raw.signalType];

  return {
    id: raw.id,
    ticker: raw.ticker,
    name: raw.name ?? raw.ticker,
    type: ACTION_TO_TYPE[raw.action] ?? "watch",
    strategy: raw.strategy,
    indicator: raw.signalType,
    indicatorValue: `${raw.score}/100`,
    reason: reasons.join("; "),
    reasons,
    price: raw.price ?? 0,
    triggeredAt: raw.triggeredAt,
    status: raw.userDecision === "confirmed" ? "executed"
      : raw.userDecision === "ignored" ? "cancelled"
        : "active",
    userDecision: raw.userDecision ?? "pending",
    userDecisionAt: raw.userDecisionAt ?? undefined,
    userNotes: raw.userNotes ?? undefined,
  };
}

function mapSignalStats(raw: SignalStatsRaw): SignalStats {
  return {
    total: raw.total ?? 0,
    active: raw.today ?? 0,
    byStrategy: {
      index: raw.byStrategy?.index ?? 0,
      long: raw.byStrategy?.long ?? 0,
      mid: raw.byStrategy?.mid ?? 0,
      short: raw.byStrategy?.short ?? 0,
    },
    byType: {
      buy: raw.byAction?.BUY ?? 0,
      sell: raw.byAction?.SELL ?? 0,
      watch: raw.byAction?.HOLD ?? raw.byAction?.WATCH ?? 0,
      alert: raw.byAction?.WATCH ?? 0,
    },
    byDecision: {
      confirmed: raw.byDecision?.confirmed ?? 0,
      ignored: raw.byDecision?.ignored ?? 0,
      pending: raw.total - (raw.byDecision?.confirmed ?? 0) - (raw.byDecision?.ignored ?? 0),
    },
  };
}

export const signalsApi = {
  getAll: async (filters: SignalFilters = {}): Promise<SignalsListResponse> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append("page_size", filters.limit.toString());
    if (filters.strategy) params.append("strategy", filters.strategy);
    if (filters.ticker) params.append("ticker", filters.ticker);
    if (filters.action) params.append("action", filters.action);

    const query = params.toString();
    const raw = await request<SignalsResponseRaw>(
      `/api/signals${query ? `?${query}` : ""}`
    );
    return {
      signals: (raw.signals || []).map(mapTradingSignal),
      total: raw.total,
      stats: raw.stats ? mapSignalStats(raw.stats) : undefined,
    };
  },

  getStats: () => request<SignalStatsResponse>("/api/signals/stats"),

  getScannerStatus: () => request<ScannerStatus>("/api/signals/scanner-status"),

  // Fix [低]: 后端返回 { status, signal } 包装，解包提取 signal
  confirm: async (signalId: string, notes?: string): Promise<TradingSignal> => {
    const raw = await request<{ status: string; signal: TradingSignalRaw }>(
      `/api/signals/${encodeURIComponent(signalId)}/confirm`,
      { method: "POST", body: JSON.stringify({ notes }) }
    );
    return mapTradingSignal(raw.signal);
  },

  ignore: async (signalId: string, notes?: string): Promise<TradingSignal> => {
    const raw = await request<{ status: string; signal: TradingSignalRaw }>(
      `/api/signals/${encodeURIComponent(signalId)}/ignore`,
      { method: "POST", body: JSON.stringify({ notes }) }
    );
    return mapTradingSignal(raw.signal);
  },
};

// ============ WebSocket ============
const WS_BASE = API_BASE.replace(/^http/, "ws");

export function createSignalWebSocket(
  onSignal: (signal: TradingSignal) => void,
  onError?: (error: Error) => void,
  onConnect?: () => void,
  onDisconnect?: () => void
): {
  connect: () => void;
  disconnect: () => void;
} {
  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let shouldReconnect = true;

  const connect = () => {
    if (ws?.readyState === WebSocket.OPEN) return;

    try {
      ws = new WebSocket(`${WS_BASE}/api/signals/ws`);

      ws.onopen = () => {
        console.log("[OMEGA WS] Connected");
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "signal") {
            onSignal(data.data);
          }
        } catch (e) {
          console.error("[OMEGA WS] Parse error:", e);
        }
      };

      ws.onclose = () => {
        console.log("[OMEGA WS] Disconnected");
        onDisconnect?.();

        if (shouldReconnect) {
          reconnectTimeout = setTimeout(() => {
            console.log("[OMEGA WS] Reconnecting...");
            connect();
          }, 3000);
        }
      };

      ws.onerror = () => {
        onError?.(new Error("WebSocket connection error"));
      };
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Connection failed"));
    }
  };

  const disconnect = () => {
    shouldReconnect = false;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    ws?.close();
    ws = null;
  };

  return { connect, disconnect };
}

// ============ 新闻数据 ============
export interface NewsTagData {
  power: string;
  impact: "positive" | "negative" | "neutral";
  summary?: string;
  taggedAt?: string;
}

export interface NewsArticleData {
  id: number;
  symbol: string;
  title: string;
  content?: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  sentimentScore?: number;
  isTagged: boolean;
  tags: NewsTagData[];
}

export interface NewsListResponse {
  articles: NewsArticleData[];
  total: number;
}

export const newsApi = {
  getStockNews: (
    symbol: string,
    options: { limit?: number; offset?: number; taggedOnly?: boolean; power?: string } = {}
  ): Promise<NewsListResponse> => {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.offset) params.set("offset", options.offset.toString());
    if (options.taggedOnly) params.set("tagged_only", "true");
    if (options.power) params.set("power", options.power);
    const query = params.toString();
    return request<NewsListResponse>(
      `/api/news/${encodeURIComponent(symbol)}${query ? `?${query}` : ""}`
    );
  },

  getMoatFeed: (
    symbol: string,
    options: { limit?: number; power?: string } = {}
  ): Promise<NewsListResponse> => {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.power) params.set("power", options.power);
    const query = params.toString();
    return request<NewsListResponse>(
      `/api/news/${encodeURIComponent(symbol)}/moat-feed${query ? `?${query}` : ""}`
    );
  },
};

// ============ 指数策略 ============
export interface IndexETFData {
  symbol: string;
  name: string;
  indexTracked: string;
  price: number;
  change: number;
  changePercent: number;
  pe: number | null;
  pe5yAvg: number | null;
  dividendYield: number | null;
  ma200: number | null;
  aboveMa200: boolean;
  rsi14: number | null;
  expenseRatio: number;
  healthStatus: "healthy" | "watch" | "caution";
  updatedAt: string;
}

export interface IndexWatchlistResponse {
  etfs: IndexETFData[];
  updatedAt: string;
}

export interface IndexOverviewResponse {
  totalEtfs: number;
  dcaStreakWeeks: number;
  valueSignals: number;
  riskAlerts: number;
}

export const indexApi = {
  getWatchlist: () => request<IndexWatchlistResponse>("/api/index/watchlist"),
  getOverview: () => request<IndexOverviewResponse>("/api/index/overview"),
  getDetail: (symbol: string) =>
    request<IndexETFData>(`/api/index/detail/${encodeURIComponent(symbol)}`),
};

// ============ 系统设置 ============
export interface SettingsData {
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    signalAlerts: boolean;
    dailyDigest: boolean;
  };
  trading: {
    autoRefresh: boolean;
    refreshInterval: number;
    riskLevel: string;
    maxPositionSize: number;
  };
  strategyAllocation: {
    longPct: number;
    midPct: number;
    shortPct: number;
  };
}

export const settingsApi = {
  get: () => request<SettingsData>("/api/settings"),
  update: (data: SettingsData) =>
    request<SettingsData>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export default {
  market: marketApi,
  stock: stockApi,
  moat: moatApi,
  signals: signalsApi,
  news: newsApi,
  index: indexApi,
  settings: settingsApi,
  createSignalWebSocket,
};
