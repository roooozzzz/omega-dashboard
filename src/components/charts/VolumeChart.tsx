"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  HistogramSeries,
  HistogramData,
  ColorType,
  CrosshairMode,
  Time,
} from "lightweight-charts";

export interface VolumeData {
  time: string | number;
  value: number;
  color?: string;
}

interface VolumeChartProps {
  data: VolumeData[];
  height?: number;
  theme?: "light" | "dark";
  priceData?: { time: string | number; close: number; open: number }[];
}

const COLORS = {
  light: {
    background: "#FFFFFF",
    text: "#0A2540",
    textSecondary: "#697386",
    grid: "#F0F0F0",
    border: "#E6E6E6",
    upColor: "rgba(48, 177, 113, 0.5)",
    downColor: "rgba(223, 27, 65, 0.5)",
  },
  dark: {
    background: "#0A2540",
    text: "#FFFFFF",
    textSecondary: "#A3B1BF",
    grid: "#1E3A5F",
    border: "#2D4A6F",
    upColor: "rgba(48, 177, 113, 0.5)",
    downColor: "rgba(223, 27, 65, 0.5)",
  },
} as const;

export function VolumeChart({
  data,
  height = 120,
  theme = "light",
  priceData,
}: VolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const priceDataRef = useRef(priceData);
  priceDataRef.current = priceData;

  const currentColors = COLORS[theme];

  const formatData = useCallback(
    (rawData: VolumeData[]): HistogramData<Time>[] => {
      return rawData.map((item, index) => {
        let color = currentColors.upColor;
        const pd = priceDataRef.current;
        if (pd && pd[index]) {
          color = pd[index].close >= pd[index].open ? currentColors.upColor : currentColors.downColor;
        } else if (item.color) {
          color = item.color;
        }
        return {
          time: (typeof item.time === "string" ? item.time : new Date(item.time).toISOString().split("T")[0]) as Time,
          value: item.value,
          color,
        };
      });
    },
    [currentColors]
  );

  // 创建图表（只在 theme/height 变化时重建）
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: currentColors.background },
        textColor: currentColors.text,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: "transparent" },
        horzLines: { color: currentColors.grid, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { width: 1, color: currentColors.textSecondary, style: 2, labelVisible: false },
        horzLine: { width: 1, color: currentColors.textSecondary, style: 2, labelBackgroundColor: currentColors.text },
      },
      rightPriceScale: { borderColor: currentColors.border, scaleMargins: { top: 0.1, bottom: 0 } },
      timeScale: { borderColor: currentColors.border, visible: true, timeVisible: true, rightOffset: 5, barSpacing: 8, minBarSpacing: 4 },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    chart.priceScale("").applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });

    const formattedData = formatData(data);
    volumeSeries.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, height]);

  // 数据更新时只更新数据
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const formattedData = formatData(data);
      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data, formatData]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden transition-all duration-300"
      style={{ height: `${height}px` }}
    />
  );
}
