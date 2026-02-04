"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  signalsApi,
  createSignalWebSocket,
  TradingSignal,
  SignalStats,
  SignalFilters,
  ApiError,
} from "@/lib/api";

// ============ 获取信号列表 ============
interface UseSignalsOptions {
  limit?: number;
  strategy?: "long" | "mid" | "short";
  ticker?: string;
  status?: "active" | "executed" | "expired" | "cancelled";
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSignalsResult {
  signals: TradingSignal[];
  total: number;
  loading: boolean;
  error: string | null;
  stats: SignalStats | null;
  refresh: () => Promise<void>;
}

export function useSignals(options: UseSignalsOptions = {}): UseSignalsResult {
  const {
    limit = 50,
    strategy,
    ticker,
    status,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const filters: SignalFilters = { limit };
      if (strategy) filters.strategy = strategy;
      if (ticker) filters.ticker = ticker;
      if (status) filters.status = status;

      const [signalsRes, statsRes] = await Promise.all([
        signalsApi.getAll(filters),
        signalsApi.getStats(),
      ]);

      setSignals(signalsRes.signals || []);
      setTotal(signalsRes.total || 0);
      setStats(statsRes.stats || null);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("获取信号数据失败");
      }
      console.error("Signals fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, strategy, ticker, status]);

  useEffect(() => {
    fetchData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  return { signals, total, loading, error, stats, refresh: fetchData };
}

// ============ WebSocket 实时信号流 ============
interface UseSignalStreamOptions {
  onSignal?: (signal: TradingSignal) => void;
  autoConnect?: boolean;
}

interface UseSignalStreamResult {
  connected: boolean;
  lastSignal: TradingSignal | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useSignalStream(
  options: UseSignalStreamOptions = {}
): UseSignalStreamResult {
  const { onSignal, autoConnect = false } = options;

  const [connected, setConnected] = useState(false);
  const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<{
    connect: () => void;
    disconnect: () => void;
  } | null>(null);

  useEffect(() => {
    wsRef.current = createSignalWebSocket(
      (signal) => {
        setLastSignal(signal);
        onSignal?.(signal);
      },
      (err) => setError(err.message),
      () => {
        setConnected(true);
        setError(null);
      },
      () => setConnected(false)
    );

    if (autoConnect) {
      wsRef.current.connect();
    }

    return () => {
      wsRef.current?.disconnect();
    };
  }, [onSignal, autoConnect]);

  const connect = useCallback(() => {
    wsRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
  }, []);

  return { connected, lastSignal, error, connect, disconnect };
}

// ============ 按策略获取信号 ============
export function useLongTermSignals(options: Omit<UseSignalsOptions, "strategy"> = {}) {
  return useSignals({ ...options, strategy: "long" });
}

export function useMidTermSignals(options: Omit<UseSignalsOptions, "strategy"> = {}) {
  return useSignals({ ...options, strategy: "mid" });
}

export function useShortTermSignals(options: Omit<UseSignalsOptions, "strategy"> = {}) {
  return useSignals({ ...options, strategy: "short" });
}

export type { TradingSignal, SignalStats };
