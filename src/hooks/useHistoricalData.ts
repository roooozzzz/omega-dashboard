"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeRange } from "@/components/charts";
import { OHLCData } from "@/components/charts/CandlestickChart";
import { VolumeData } from "@/components/charts/VolumeChart";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HistoricalData {
  ohlc: OHLCData[];
  volume: VolumeData[];
}

interface StockHistoryItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function filterByRange(items: StockHistoryItem[], range: TimeRange): StockHistoryItem[] {
  if (range === "ALL") return items;

  const now = new Date();
  let cutoff: Date;
  switch (range) {
    case "1D":
      cutoff = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      break;
    case "1W":
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "1M":
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "3M":
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1Y":
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return items.filter((item) => new Date(item.date) >= cutoff);
}

export function useHistoricalData(symbol: string | null, range: TimeRange = "1M") {
  const [data, setData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(symbol)}`, {
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const stockDetail = await res.json();
      const history: StockHistoryItem[] = stockDetail.history || [];
      const filtered = filterByRange(history, range);

      const ohlc: OHLCData[] = filtered.map((h) => ({
        time: h.date,
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
      }));

      const volume: VolumeData[] = filtered.map((h) => ({
        time: h.date,
        value: h.volume,
      }));

      setData({ ohlc, volume });
    } catch (err) {
      setError(`获取 ${symbol} 历史数据失败`);
      console.error(`Historical data fetch error for ${symbol}:`, err);
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
