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
  sp500: IndexData | null;
  vix: VixData | null;
  nasdaq: IndexData | null;
  dow: IndexData | null;
  updatedAt: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface VixData extends IndexData {
  level: "low" | "moderate" | "high" | "extreme";
}

export const marketApi = {
  getData: () => request<MarketDataResponse>("/api/market"),
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

export const stockApi = {
  getStock: (symbol: string) =>
    request<StockData>(`/api/stock/${encodeURIComponent(symbol)}`),
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

export const moatApi = {
  getAll: () => request<MoatListResponse>("/api/moat"),
  
  getByTicker: (ticker: string) =>
    request<MoatData>(`/api/moat/${encodeURIComponent(ticker)}`),
  
  getStrongBuys: () => request<StrongBuysResponse>("/api/moat/strong-buys"),
  
  propose: (ticker: string) =>
    request<MoatData>("/api/moat", {
      method: "POST",
      body: JSON.stringify({ ticker }),
    }),
  
  approve: (ticker: string) =>
    request<MoatData>(`/api/moat/${encodeURIComponent(ticker)}/approve`, {
      method: "POST",
    }),
  
  reject: (ticker: string, reason?: string) =>
    request<{ message: string }>(
      `/api/moat/${encodeURIComponent(ticker)}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    ),
  
  update: (ticker: string, data: Partial<MoatData>) =>
    request<MoatData>(`/api/moat/${encodeURIComponent(ticker)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ============ 交易信号 ============
export interface TradingSignal {
  id: string;
  ticker: string;
  name: string;
  type: "buy" | "sell" | "watch" | "alert";
  strategy: "long" | "mid" | "short";
  indicator: string;
  indicatorValue: string;
  reason: string;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  triggeredAt: string;
  expiresAt?: string;
  status: "active" | "executed" | "expired" | "cancelled";
}

export interface SignalStats {
  total: number;
  active: number;
  byStrategy: {
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
}

export interface SignalsListResponse {
  signals: TradingSignal[];
  total: number;
}

export interface SignalStatsResponse {
  stats: SignalStats;
}

export interface SignalFilters {
  limit?: number;
  strategy?: "long" | "mid" | "short";
  ticker?: string;
  status?: "active" | "executed" | "expired" | "cancelled";
}

export const signalsApi = {
  getAll: (filters: SignalFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.strategy) params.append("strategy", filters.strategy);
    if (filters.ticker) params.append("ticker", filters.ticker);
    if (filters.status) params.append("status", filters.status);
    
    const query = params.toString();
    return request<SignalsListResponse>(
      `/api/signals${query ? `?${query}` : ""}`
    );
  },
  
  getStats: () => request<SignalStatsResponse>("/api/signals/stats"),
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

export default {
  market: marketApi,
  stock: stockApi,
  moat: moatApi,
  signals: signalsApi,
  createSignalWebSocket,
};
