"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeRange } from "@/components/charts";
import { OHLCData } from "@/components/charts/CandlestickChart";
import { VolumeData } from "@/components/charts/VolumeChart";

interface HistoricalData {
  ohlc: OHLCData[];
  volume: VolumeData[];
}

// Generate mock historical data for demonstration
function generateMockData(symbol: string, range: TimeRange): HistoricalData {
  const now = new Date();
  const ohlc: OHLCData[] = [];
  const volume: VolumeData[] = [];

  // Determine number of data points based on range
  let days: number;
  switch (range) {
    case "1D":
      days = 1;
      break;
    case "1W":
      days = 7;
      break;
    case "1M":
      days = 30;
      break;
    case "3M":
      days = 90;
      break;
    case "1Y":
      days = 365;
      break;
    case "ALL":
      days = 730;
      break;
    default:
      days = 30;
  }

  // Generate a seed based on symbol for consistent data
  const seed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  // Start price based on symbol
  let basePrice = 100 + (seed % 400);
  let price = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    const volatility = 0.02 + pseudoRandom(i * 3) * 0.03;
    const trend = pseudoRandom(i * 7) > 0.5 ? 1 : -1;
    const change = price * volatility * trend;

    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + pseudoRandom(i * 2) * 0.01);
    const low = Math.min(open, close) * (1 - pseudoRandom(i * 5) * 0.01);

    price = close;

    ohlc.push({
      time: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    volume.push({
      time: dateStr,
      value: Math.floor(1000000 + pseudoRandom(i * 11) * 5000000),
    });
  }

  return { ohlc, volume };
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
      // In production, this would fetch from an API
      // For now, generate mock data
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
      const historicalData = generateMockData(symbol, range);
      setData(historicalData);
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
