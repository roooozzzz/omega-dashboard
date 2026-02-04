"use client";

import { useState, useEffect, useCallback } from "react";
import { moatApi, MoatData, MoatListResponse, StrongBuysResponse, ApiError } from "@/lib/api";

// ============ 获取所有护城河数据 ============
interface UseMoatListResult {
  data: MoatData[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMoatList(autoRefresh = false, refreshInterval = 60000): UseMoatListResult {
  const [data, setData] = useState<MoatData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result: MoatListResponse = await moatApi.getAll();
      setData(result.moats || []);
      setTotal(result.total || 0);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("获取护城河数据失败");
      }
      console.error("Moat list fetch error:", err);
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

  return { data, total, loading, error, refresh: fetchData };
}

// ============ 获取单只股票护城河数据 ============
interface UseMoatDataResult {
  data: MoatData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMoatData(ticker: string | null): UseMoatDataResult {
  const [data, setData] = useState<MoatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!ticker) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await moatApi.getByTicker(ticker);
      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError(`${ticker} 暂无护城河评分`);
        } else {
          setError(err.message);
        }
      } else {
        setError(`获取 ${ticker} 护城河数据失败`);
      }
      console.error(`Moat data fetch error for ${ticker}:`, err);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// ============ 获取 STRONG_BUY 列表 ============
interface UseStrongBuysResult {
  data: MoatData[];
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStrongBuys(): UseStrongBuysResult {
  const [data, setData] = useState<MoatData[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result: StrongBuysResponse = await moatApi.getStrongBuys();
      setData(result.strongBuys || []);
      setCount(result.count || 0);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("获取 STRONG_BUY 列表失败");
      }
      console.error("Strong buys fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, count, loading, error, refresh: fetchData };
}

// ============ 护城河操作 Hooks ============
interface UseMoatActionsResult {
  proposing: boolean;
  approving: boolean;
  rejecting: boolean;
  error: string | null;
  propose: (ticker: string) => Promise<MoatData | null>;
  approve: (ticker: string) => Promise<MoatData | null>;
  reject: (ticker: string, reason?: string) => Promise<boolean>;
}

export function useMoatActions(): UseMoatActionsResult {
  const [proposing, setProposing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propose = useCallback(async (ticker: string): Promise<MoatData | null> => {
    setProposing(true);
    setError(null);
    try {
      const result = await moatApi.propose(ticker);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`提交 ${ticker} 评分请求失败`);
      }
      return null;
    } finally {
      setProposing(false);
    }
  }, []);

  const approve = useCallback(async (ticker: string): Promise<MoatData | null> => {
    setApproving(true);
    setError(null);
    try {
      const result = await moatApi.approve(ticker);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`审批 ${ticker} 失败`);
      }
      return null;
    } finally {
      setApproving(false);
    }
  }, []);

  const reject = useCallback(async (ticker: string, reason?: string): Promise<boolean> => {
    setRejecting(true);
    setError(null);
    try {
      await moatApi.reject(ticker, reason);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`拒绝 ${ticker} 失败`);
      }
      return false;
    } finally {
      setRejecting(false);
    }
  }, []);

  return { proposing, approving, rejecting, error, propose, approve, reject };
}

export type { MoatData };
