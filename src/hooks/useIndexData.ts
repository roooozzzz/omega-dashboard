"use client";

import { useState, useEffect, useCallback } from "react";
import {
  indexApi,
  IndexETFData,
  IndexWatchlistResponse,
  IndexOverviewResponse,
  ApiError,
} from "@/lib/api";
import {
  MOCK_INDEX_WATCHLIST,
  MOCK_INDEX_OVERVIEW,
} from "@/lib/mock/index-mock";

// ============ ETF 监控列表 ============
interface UseIndexWatchlistResult {
  etfs: IndexETFData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIndexWatchlist(
  autoRefresh = false,
  refreshInterval = 60000
): UseIndexWatchlistResult {
  const [etfs, setEtfs] = useState<IndexETFData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result: IndexWatchlistResponse = await indexApi.getWatchlist();
      setEtfs(result.etfs || []);
      setError(null);
    } catch (err) {
      // 后端未就绪时回退到 mock 数据
      console.warn("Index watchlist API 未就绪，使用 mock 数据:", err);
      setEtfs(MOCK_INDEX_WATCHLIST.etfs);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  return { etfs, loading, error, refresh: fetchData };
}

// ============ 指数策略概览 ============
interface UseIndexOverviewResult {
  data: IndexOverviewResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIndexOverview(): UseIndexOverviewResult {
  const [data, setData] = useState<IndexOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await indexApi.getOverview();
      setData(result);
      setError(null);
    } catch (err) {
      // 后端未就绪时回退到 mock 数据
      console.warn("Index overview API 未就绪，使用 mock 数据:", err);
      setData(MOCK_INDEX_OVERVIEW);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export type { IndexETFData };
