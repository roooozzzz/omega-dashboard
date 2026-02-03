"use client";

import { useState, useEffect, useCallback } from "react";

interface MarketData {
  sp500: {
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
  } | null;
  vix: {
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
    level: string;
  } | null;
  nasdaq: {
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
  } | null;
  dow: {
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
  } | null;
  updatedAt: string;
}

interface StockData {
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

/**
 * 获取市场数据的 Hook
 */
export function useMarketData(refreshInterval = 60000) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/market");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("获取市场数据失败");
      console.error("Market data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * 获取单只股票数据的 Hook
 */
export function useStockData(symbol: string | null) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`获取 ${symbol} 数据失败`);
      console.error(`Stock data fetch error for ${symbol}:`, err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * 批量获取股票数据的 Hook
 */
export function useMultipleStocks(symbols: string[]) {
  const [data, setData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const response = await fetch(`/api/stock?symbol=${symbol}`);
          const result = await response.json();
          return { symbol, data: result.success ? result.data : null };
        })
      );

      const stockData: Record<string, StockData> = {};
      results.forEach(({ symbol, data }) => {
        if (data) stockData[symbol] = data;
      });

      setData(stockData);
      setError(null);
    } catch (err) {
      setError("获取股票数据失败");
      console.error("Multiple stocks fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
