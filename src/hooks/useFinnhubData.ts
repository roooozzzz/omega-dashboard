"use client";

import { useState, useEffect, useCallback } from "react";
import {
  marketApi,
  NewsSentiment,
  AnalystRecommendation,
  ApiError,
} from "@/lib/api";

// ============ 新闻情绪 ============

interface UseSentimentResult {
  data: NewsSentiment | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSentiment(symbol: string | null): UseSentimentResult {
  const [data, setData] = useState<NewsSentiment | null>(null);
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
      const result = await marketApi.getSentiment(symbol);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`获取 ${symbol} 情绪数据失败`);
      }
      console.error(`Sentiment fetch error for ${symbol}:`, err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// ============ 分析师评级 ============

interface UseRecommendationResult {
  data: AnalystRecommendation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRecommendation(
  symbol: string | null
): UseRecommendationResult {
  const [data, setData] = useState<AnalystRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await marketApi.getRecommendation(symbol);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`获取 ${symbol} 分析师评级失败`);
      }
      console.error(`Recommendation fetch error for ${symbol}:`, err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
