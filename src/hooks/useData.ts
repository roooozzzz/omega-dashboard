"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDataOptions {
  refreshInterval?: number; // 自动刷新间隔 (毫秒)
  enabled?: boolean;        // 是否启用
}

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * 通用数据获取 Hook
 */
export function useData<T>(
  url: string,
  options: UseDataOptions = {}
): UseDataResult<T> {
  const { refreshInterval, enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refresh: fetchData, lastUpdated };
}

// ============ 市场数据 Hook ============

interface MarketData {
  sp500: {
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
  } | null;
  nasdaq: typeof sp500;
  dow: typeof sp500;
  vix: {
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
    level: string;
  } | null;
  updatedAt: string;
}

const sp500 = null as MarketData["sp500"]; // Type helper

export function useMarketData(refreshInterval = 60000) {
  return useData<MarketData>("/api/market", { refreshInterval });
}

// ============ 股票数据 Hook ============

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  rs: {
    rsRating: number;
    return6m: number;
    return3m: number;
    return1m: number;
  };
  rsi: {
    rsi: number;
    signal: "oversold" | "neutral" | "overbought";
  };
  week52High: number;
  week52Low: number;
  updatedAt: string;
}

export function useStockData(symbol: string, refreshInterval = 30000) {
  return useData<StockData>(`/api/stock?symbol=${symbol}`, {
    refreshInterval,
    enabled: !!symbol,
  });
}

// ============ 多股票数据 Hook ============

export function useMultipleStocks(symbols: string[], refreshInterval = 30000) {
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (symbols.length === 0) return;
    
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const response = await fetch(`/api/stock?symbol=${symbol}`);
          const result = await response.json();
          return { symbol, data: result.success ? result.data : null };
        })
      );

      const newStocks: Record<string, StockData> = {};
      results.forEach(({ symbol, data }) => {
        if (data) newStocks[symbol] = data;
      });
      setStocks(newStocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchAll();

    if (refreshInterval) {
      const interval = setInterval(fetchAll, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAll, refreshInterval]);

  return { stocks, loading, error, refresh: fetchAll };
}
