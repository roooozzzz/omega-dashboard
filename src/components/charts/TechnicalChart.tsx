"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  ColorType,
  CrosshairMode,
  Time,
  LineStyle,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";
import { OHLCData } from "./CandlestickChart";
import { VolumeData } from "./VolumeChart";

interface TechnicalChartProps {
  data: OHLCData[];
  volumeData?: VolumeData[];
  height?: number;
  theme?: "light" | "dark";
  showMA?: boolean;
  maLengths?: number[];
  showBollinger?: boolean;
  bollingerLength?: number;
  bollingerStdDev?: number;
  showVolume?: boolean;
  onCrosshairMove?: (data: {
    candle: OHLCData | null;
    ma?: Record<number, number | null>;
    bollinger?: { upper: number | null; middle: number | null; lower: number | null };
  }) => void;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], length: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < length - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += data[i - j];
    }
    result.push(sum / length);
  }
  return result;
}

// Calculate Standard Deviation
function calculateStdDev(data: number[], length: number, ma: (number | null)[]): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < length - 1 || ma[i] === null) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += Math.pow(data[i - j] - (ma[i] as number), 2);
    }
    result.push(Math.sqrt(sum / length));
  }
  return result;
}

export function TechnicalChart({
  data,
  volumeData,
  height = 500,
  theme = "light",
  showMA = true,
  maLengths = [5, 20, 60],
  showBollinger = true,
  bollingerLength = 20,
  bollingerStdDev = 2,
  showVolume = true,
  onCrosshairMove,
}: TechnicalChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const maSeriesRefs = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  const bollingerSeriesRefs = useRef<{
    upper: ISeriesApi<"Line"> | null;
    middle: ISeriesApi<"Line"> | null;
    lower: ISeriesApi<"Line"> | null;
  }>({ upper: null, middle: null, lower: null });

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
      volumeUp: "rgba(48, 177, 113, 0.3)",
      volumeDown: "rgba(223, 27, 65, 0.3)",
      ma: ["#635BFF", "#FF9500", "#00C7BE"],
      bollingerUpper: "rgba(99, 91, 255, 0.6)",
      bollingerMiddle: "rgba(99, 91, 255, 0.8)",
      bollingerLower: "rgba(99, 91, 255, 0.6)",
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
      volumeUp: "rgba(48, 177, 113, 0.4)",
      volumeDown: "rgba(223, 27, 65, 0.4)",
      ma: ["#818CF8", "#FFB84D", "#5EEAD4"],
      bollingerUpper: "rgba(129, 140, 248, 0.6)",
      bollingerMiddle: "rgba(129, 140, 248, 0.8)",
      bollingerLower: "rgba(129, 140, 248, 0.6)",
    },
  };

  const currentColors = colors[theme];

  const formatCandleData = useCallback((rawData: OHLCData[]): CandlestickData[] => {
    return rawData.map((item) => ({
      time: (typeof item.time === "string"
        ? item.time
        : new Date(item.time).toISOString().split("T")[0]) as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
  }, []);

  const formatVolumeData = useCallback(
    (rawData: OHLCData[], volumes?: VolumeData[]): HistogramData[] => {
      if (volumes) {
        return volumes.map((item, index) => ({
          time: (typeof item.time === "string"
            ? item.time
            : new Date(item.time).toISOString().split("T")[0]) as Time,
          value: item.value,
          color:
            rawData[index] && rawData[index].close >= rawData[index].open
              ? currentColors.volumeUp
              : currentColors.volumeDown,
        }));
      }
      return [];
    },
    [currentColors]
  );

  // Calculate technical indicators
  const indicators = useMemo(() => {
    const closes = data.map((d) => d.close);
    const times = data.map((d) =>
      typeof d.time === "string" ? d.time : new Date(d.time).toISOString().split("T")[0]
    );

    // Calculate MAs
    const maData: Record<number, LineData[]> = {};
    maLengths.forEach((length) => {
      const sma = calculateSMA(closes, length);
      maData[length] = sma
        .map((value, index) =>
          value !== null ? { time: times[index] as Time, value } : null
        )
        .filter((d): d is LineData => d !== null);
    });

    // Calculate Bollinger Bands
    const bollingerMiddle = calculateSMA(closes, bollingerLength);
    const stdDev = calculateStdDev(closes, bollingerLength, bollingerMiddle);
    
    const bollingerData = {
      upper: bollingerMiddle
        .map((middle, index) => {
          if (middle === null || stdDev[index] === null) return null;
          return { time: times[index] as Time, value: middle + bollingerStdDev * (stdDev[index] as number) };
        })
        .filter((d): d is LineData => d !== null),
      middle: bollingerMiddle
        .map((value, index) =>
          value !== null ? { time: times[index] as Time, value } : null
        )
        .filter((d): d is LineData => d !== null),
      lower: bollingerMiddle
        .map((middle, index) => {
          if (middle === null || stdDev[index] === null) return null;
          return { time: times[index] as Time, value: middle - bollingerStdDev * (stdDev[index] as number) };
        })
        .filter((d): d is LineData => d !== null),
    };

    return { maData, bollingerData };
  }, [data, maLengths, bollingerLength, bollingerStdDev]);

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
        vertLines: { color: currentColors.grid, style: 1 },
        horzLines: { color: currentColors.grid, style: 1 },
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
          top: 0.05,
          bottom: showVolume ? 0.25 : 0.05,
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
    candlestickSeries.setData(formatCandleData(data));
    candleSeriesRef.current = candlestickSeries;

    // Add volume histogram if enabled (v5 API)
    if (showVolume && volumeData) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
      });

      volumeSeries.setData(formatVolumeData(data, volumeData));
      volumeSeriesRef.current = volumeSeries;
    }

    // Add MA lines (v5 API)
    if (showMA) {
      maLengths.forEach((length, index) => {
        const maSeries = chart.addSeries(LineSeries, {
          color: currentColors.ma[index % currentColors.ma.length],
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        maSeries.setData(indicators.maData[length]);
        maSeriesRefs.current.set(length, maSeries);
      });
    }

    // Add Bollinger Bands (v5 API)
    if (showBollinger) {
      const upperSeries = chart.addSeries(LineSeries, {
        color: currentColors.bollingerUpper,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      upperSeries.setData(indicators.bollingerData.upper);
      bollingerSeriesRefs.current.upper = upperSeries;

      const middleSeries = chart.addSeries(LineSeries, {
        color: currentColors.bollingerMiddle,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      middleSeries.setData(indicators.bollingerData.middle);
      bollingerSeriesRefs.current.middle = middleSeries;

      const lowerSeries = chart.addSeries(LineSeries, {
        color: currentColors.bollingerLower,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      lowerSeries.setData(indicators.bollingerData.lower);
      bollingerSeriesRefs.current.lower = lowerSeries;
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    // Handle crosshair move
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (param.time && param.seriesData.size > 0) {
          const candleData = param.seriesData.get(candlestickSeries);
          let candle: OHLCData | null = null;
          
          if (candleData && "open" in candleData) {
            const ohlc = candleData as CandlestickData;
            candle = {
              time: ohlc.time as string | number,
              open: ohlc.open,
              high: ohlc.high,
              low: ohlc.low,
              close: ohlc.close,
            };
          }

          const maValues: Record<number, number | null> = {};
          maSeriesRefs.current.forEach((series, length) => {
            const maData = param.seriesData.get(series);
            maValues[length] = maData && "value" in maData ? (maData as LineData).value : null;
          });

          const bollingerValues = {
            upper: bollingerSeriesRefs.current.upper
              ? (param.seriesData.get(bollingerSeriesRefs.current.upper) as LineData | undefined)?.value ?? null
              : null,
            middle: bollingerSeriesRefs.current.middle
              ? (param.seriesData.get(bollingerSeriesRefs.current.middle) as LineData | undefined)?.value ?? null
              : null,
            lower: bollingerSeriesRefs.current.lower
              ? (param.seriesData.get(bollingerSeriesRefs.current.lower) as LineData | undefined)?.value ?? null
              : null,
          };

          onCrosshairMove({ candle, ma: maValues, bollinger: bollingerValues });
        } else {
          onCrosshairMove({ candle: null });
        }
      });
    }

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
      maSeriesRefs.current.clear();
      bollingerSeriesRefs.current = { upper: null, middle: null, lower: null };
      chart.remove();
    };
  }, [
    data,
    volumeData,
    height,
    theme,
    showMA,
    maLengths,
    showBollinger,
    showVolume,
    currentColors,
    formatCandleData,
    formatVolumeData,
    indicators,
    onCrosshairMove,
  ]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden transition-all duration-300"
      style={{ height: `${height}px` }}
    />
  );
}
