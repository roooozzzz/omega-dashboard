"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  strategy?: "index" | "long" | "mid" | "short";
  ticker?: string;
  action?: string;
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
    action,
    status,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const failCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const filters: SignalFilters = { limit };
      if (strategy) filters.strategy = strategy;
      if (ticker) filters.ticker = ticker;
      if (action) filters.action = action;
      if (status) filters.status = status;

      const signalsRes = await signalsApi.getAll(filters);

      setSignals(signalsRes.signals || []);
      setTotal(signalsRes.total || 0);

      // stats 已在 api.ts 的 mapSignalStats 中完成映射
      if (signalsRes.stats) {
        setStats(signalsRes.stats);
      }
      setError(null);
      failCountRef.current = 0;
    } catch (err) {
      failCountRef.current += 1;
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("获取信号数据失败");
      }
      if (failCountRef.current <= 3) {
        console.warn(`Signals fetch failed (${failCountRef.current}):`, err);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [limit, strategy, ticker, action, status]);

  useEffect(() => {
    fetchData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (failCountRef.current >= 3) return;
        fetchData();
      }, refreshInterval);
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
  const onSignalRef = useRef(onSignal);
  onSignalRef.current = onSignal;

  const wsRef = useRef<{
    connect: () => void;
    disconnect: () => void;
  } | null>(null);

  useEffect(() => {
    wsRef.current = createSignalWebSocket(
      (signal) => {
        setLastSignal(signal);
        onSignalRef.current?.(signal);
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
  }, [autoConnect]);

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

export function useIndexSignals(options: Omit<UseSignalsOptions, "strategy"> = {}) {
  return useSignals({ ...options, strategy: "index" });
}

// ============ 跨策略信号共振映射 ============
type StrategyKey = "index" | "long" | "mid" | "short";

export function useCrossStrategyMap(currentStrategy?: StrategyKey) {
  const { signals } = useSignals({ limit: 100, autoRefresh: true, refreshInterval: 60000 });

  const crossMap = useMemo(() => {
    const map: Record<string, Array<{ strategy: StrategyKey; indicator: string }>> = {};
    for (const sig of signals) {
      if (!map[sig.ticker]) map[sig.ticker] = [];
      if (!map[sig.ticker].some(s => s.strategy === sig.strategy)) {
        map[sig.ticker].push({ strategy: sig.strategy as StrategyKey, indicator: sig.indicator });
      }
    }
    return map;
  }, [signals]);

  return crossMap;
}

export type { TradingSignal, SignalStats };
