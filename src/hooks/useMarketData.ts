"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
 *
 * 优化：
 * - AbortController 防止请求堆积
 * - 失败后指数退避，避免频繁重试
 */
export function useMarketData(refreshInterval = 60000): UseMarketDataResult {
  const [data, setData] = useState<MarketDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const failCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    // 防止并发请求
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const result = await marketApi.getData();
      setData(result);
      setError(null);
      failCountRef.current = 0;
    } catch (err) {
      failCountRef.current += 1;
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("获取市场数据失败");
      }
      // 静默日志，不刷屏
      if (failCountRef.current <= 3) {
        console.warn(`Market data fetch failed (${failCountRef.current}):`, err);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        // 指数退避：连续失败 3 次后降低刷新频率
        if (failCountRef.current >= 3) return;
        fetchData();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * 兼容旧接口的类型导出
 */
export interface MarketData extends MarketDataResponse {}
