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
  const failCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const filters: SignalFilters = { limit };
      if (strategy) filters.strategy = strategy;
      if (ticker) filters.ticker = ticker;
      if (status) filters.status = status;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signalsRes: any = await signalsApi.getAll(filters);

      setSignals(signalsRes.signals || []);
      setTotal(signalsRes.total || 0);

      // stats 内嵌在 signals 响应中，字段名映射
      const rawStats = signalsRes.stats;
      if (rawStats) {
        const byStrategy = rawStats.byStrategy ?? rawStats.by_strategy ?? {};
        const byAction = rawStats.byAction ?? rawStats.by_action ?? {};
        const byDecision = rawStats.byDecision ?? rawStats.by_decision ?? {};
        setStats({
          total: rawStats.total ?? 0,
          active: rawStats.today ?? 0,
          byStrategy: {
            long: byStrategy.long ?? 0,
            mid: byStrategy.mid ?? 0,
            short: byStrategy.short ?? 0,
          },
          byType: {
            buy: byAction.BUY ?? byAction.buy ?? 0,
            sell: byAction.SELL ?? byAction.sell ?? 0,
            watch: byAction.WATCH ?? byAction.watch ?? 0,
            alert: byAction.alert ?? 0,
          },
          byDecision: {
            confirmed: byDecision.confirmed ?? 0,
            ignored: byDecision.ignored ?? 0,
            pending: byDecision.pending ?? 0,
          },
        });
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
  }, [limit, strategy, ticker, status]);

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

export type { TradingSignal, SignalStats };
