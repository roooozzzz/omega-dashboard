"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  CandlestickData,
  ColorType,
  CrosshairMode,
  Time,
} from "lightweight-charts";

export interface OHLCData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: OHLCData[];
  height?: number;
  theme?: "light" | "dark";
  showGrid?: boolean;
  onCrosshairMove?: (data: OHLCData | null) => void;
}

export function CandlestickChart({
  data,
  height = 400,
  theme = "light",
  showGrid = true,
  onCrosshairMove,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const colors = {
    light: {
      background: "#FFFFFF",
      text: "#0A2540",
      textSecondary: "#697386",
      grid: "#F0F0F0",
      border: "#E6E6E6",
      upColor: "#30B171",
      downColor: "#DF1B41",
      wickUpColor: "#30B171",
      wickDownColor: "#DF1B41",
    },
    dark: {
      background: "#0A2540",
      text: "#FFFFFF",
      textSecondary: "#A3B1BF",
      grid: "#1E3A5F",
      border: "#2D4A6F",
      upColor: "#30B171",
      downColor: "#DF1B41",
      wickUpColor: "#30B171",
      wickDownColor: "#DF1B41",
    },
  };

  const currentColors = colors[theme];

  const formatData = useCallback((rawData: OHLCData[]): CandlestickData<Time>[] => {
    return rawData.map((item) => ({
      time: (typeof item.time === "string" ? item.time : new Date(item.time).toISOString().split("T")[0]) as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: currentColors.background },
        textColor: currentColors.text,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: {
          color: showGrid ? currentColors.grid : "transparent",
          style: 1,
        },
        horzLines: {
          color: showGrid ? currentColors.grid : "transparent",
          style: 1,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: currentColors.textSecondary,
          style: 2,
          labelBackgroundColor: currentColors.text,
        },
        horzLine: {
          width: 1,
          color: currentColors.textSecondary,
          style: 2,
          labelBackgroundColor: currentColors.text,
        },
      },
      rightPriceScale: {
        borderColor: currentColors.border,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: currentColors.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
        minBarSpacing: 4,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    // Add candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: currentColors.upColor,
      downColor: currentColors.downColor,
      borderVisible: false,
      wickUpColor: currentColors.wickUpColor,
      wickDownColor: currentColors.wickDownColor,
    });

    // Set data
    const formattedData = formatData(data);
    candlestickSeries.setData(formattedData);

    // Fit content
    chart.timeScale().fitContent();

    // Subscribe to crosshair move
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (param.time && param.seriesData.size > 0) {
          const candleData = param.seriesData.get(candlestickSeries);
          if (candleData && "open" in candleData) {
            const ohlc = candleData as CandlestickData<Time>;
            onCrosshairMove({
              time: ohlc.time as string | number,
              open: ohlc.open,
              high: ohlc.high,
              low: ohlc.low,
              close: ohlc.close,
            });
          }
        } else {
          onCrosshairMove(null);
        }
      });
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height, theme, showGrid, currentColors, formatData, onCrosshairMove]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden transition-all duration-300"
      style={{ height: `${height}px` }}
    />
  );
}
