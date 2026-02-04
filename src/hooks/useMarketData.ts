"use client";

import { useState, useEffect, useCallback } from "react";
import { marketApi, MarketDataResponse, ApiError } from "@/lib/api";

interface UseMarketDataResult {
  data: MarketDataResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * 获取市场数据的 Hook
 * 调用 FastAPI 后端 /api/market
 */
export function useMarketData(refreshInterval = 60000): UseMarketDataResult {
  const [data, setData] = useState<MarketDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await marketApi.getData();
      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("获取市场数据失败");
      }
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
 * 兼容旧接口的类型导出
 */
export interface MarketData extends MarketDataResponse {}
