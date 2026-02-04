"use client";

import { useState, useEffect, useCallback } from "react";
import { stockApi, StockData, ApiError } from "@/lib/api";

interface UseStockDataResult {
  data: StockData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * 获取单只股票数据的 Hook
 * 调用 FastAPI 后端 /api/stock/{symbol}
 */
export function useStockData(symbol: string | null): UseStockDataResult {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await stockApi.getStock(symbol);
      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError(`股票 ${symbol} 不存在`);
        } else {
          setError(err.message);
        }
      } else {
        setError(`获取 ${symbol} 数据失败`);
      }
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
      setData({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        symbols.map(async (symbol) => {
          const result = await stockApi.getStock(symbol);
          return { symbol, data: result };
        })
      );

      const stockData: Record<string, StockData> = {};
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.data) {
          stockData[result.value.symbol] = result.value.data;
        }
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

export type { StockData };
