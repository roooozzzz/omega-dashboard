"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TradingSignal, SignalStats } from "@/types/signals";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

interface UseSignalsOptions {
  limit?: number;
  strategy?: "long" | "mid" | "short";
  ticker?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSignalsReturn {
  signals: TradingSignal[];
  loading: boolean;
  error: Error | null;
  stats: SignalStats | null;
  refetch: () => Promise<void>;
}

export function useSignals(options: UseSignalsOptions = {}): UseSignalsReturn {
  const { 
    limit = 50, 
    strategy, 
    ticker, 
    autoRefresh = false, 
    refreshInterval = 30000 
  } = options;

  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (strategy) params.append("strategy", strategy);
      if (ticker) params.append("ticker", ticker);

      const [signalsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/signals?${params}`),
        fetch(`${API_BASE}/api/signals/stats`)
      ]);

      if (!signalsRes.ok) throw new Error("Failed to fetch signals");
      if (!statsRes.ok) throw new Error("Failed to fetch stats");

      const signalsData = await signalsRes.json();
      const statsData = await statsRes.json();

      setSignals(signalsData.signals || []);
      setStats(statsData.stats || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [limit, strategy, ticker]);

  useEffect(() => {
    fetchSignals();

    if (autoRefresh) {
      const interval = setInterval(fetchSignals, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSignals, autoRefresh, refreshInterval]);

  return { signals, loading, error, stats, refetch: fetchSignals };
}


interface UseSignalStreamOptions {
  onSignal?: (signal: TradingSignal) => void;
  autoReconnect?: boolean;
}

interface UseSignalStreamReturn {
  connected: boolean;
  lastSignal: TradingSignal | null;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

export function useSignalStream(options: UseSignalStreamOptions = {}): UseSignalStreamReturn {
  const { onSignal, autoReconnect = true } = options;

  const [connected, setConnected] = useState(false);
  const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_BASE}/api/signals/ws`);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        console.log("[SignalStream] Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "signal") {
            setLastSignal(data.data);
            onSignal?.(data.data);
          }
        } catch (e) {
          console.error("[SignalStream] Parse error:", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("[SignalStream] Disconnected");

        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[SignalStream] Reconnecting...");
            connect();
          }, 3000);
        }
      };

      ws.onerror = (e) => {
        setError(new Error("WebSocket error"));
        console.error("[SignalStream] Error:", e);
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Connection failed"));
    }
  }, [onSignal, autoReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connected, lastSignal, error, connect, disconnect };
}
