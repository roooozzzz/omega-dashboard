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

export type SubPanel = "volume" | "rsi" | "macd" | "none";

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
  subPanel?: SubPanel;
  onCrosshairMove?: (data: {
    candle: OHLCData | null;
    ma?: Record<number, number | null>;
    bollinger?: { upper: number | null; middle: number | null; lower: number | null };
    rsi?: number | null;
    macd?: { macd: number | null; signal: number | null; histogram: number | null };
  }) => void;
}

// ============ 计算函数 ============

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

// RSI — Wilder's Smoothing
function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  if (closes.length < period + 1) return closes.map(() => null);

  const result: (number | null)[] = [null]; // 第一个值无涨跌

  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  // 前 period-1 个无值
  for (let i = 0; i < period - 1; i++) result.push(null);

  // 第一个 RSI
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));

  // 后续 Wilder 平滑
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] >= 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }

  return result;
}

// EMA
function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

// MACD (12, 26, 9)
function calculateMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  if (closes.length < slow) {
    return {
      macd: closes.map(() => null as number | null),
      signal: closes.map(() => null as number | null),
      histogram: closes.map(() => null as number | null),
    };
  }

  const emaFast = calculateEMA(closes, fast);
  const emaSlow = calculateEMA(closes, slow);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < slow - 1) macdLine.push(null);
    else macdLine.push(emaFast[i] - emaSlow[i]);
  }

  // Signal = EMA of MACD line (只取有效值)
  const validMacd = macdLine.filter((v): v is number => v !== null);
  const signalEma = calculateEMA(validMacd, signal);

  const signalLine: (number | null)[] = [];
  const histogramLine: (number | null)[] = [];
  let validIdx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      histogramLine.push(null);
    } else {
      if (validIdx < signal - 1) {
        signalLine.push(null);
        histogramLine.push(null);
      } else {
        signalLine.push(signalEma[validIdx]);
        histogramLine.push(macdLine[i]! - signalEma[validIdx]);
      }
      validIdx++;
    }
  }

  return { macd: macdLine, signal: signalLine, histogram: histogramLine };
}

// ============ 组件 ============

export function TechnicalChart({
  data,
  volumeData,
  height = 500,
  theme = "light",
  showMA = true,
  maLengths = [20, 50, 200],
  showBollinger = true,
  bollingerLength = 20,
  bollingerStdDev = 2,
  subPanel = "volume",
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
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdLineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null);

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
      ma: ["#FF9500", "#635BFF", "#00C7BE"],
      bollingerUpper: "rgba(99, 91, 255, 0.6)",
      bollingerMiddle: "rgba(99, 91, 255, 0.8)",
      bollingerLower: "rgba(99, 91, 255, 0.6)",
      rsiLine: "#635BFF",
      rsiOverbought: "rgba(223, 27, 65, 0.4)",
      rsiOversold: "rgba(48, 177, 113, 0.4)",
      macdLine: "#635BFF",
      macdSignal: "#FF9500",
      macdHistUp: "rgba(48, 177, 113, 0.6)",
      macdHistDown: "rgba(223, 27, 65, 0.6)",
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
      ma: ["#FFB84D", "#818CF8", "#5EEAD4"],
      bollingerUpper: "rgba(129, 140, 248, 0.6)",
      bollingerMiddle: "rgba(129, 140, 248, 0.8)",
      bollingerLower: "rgba(129, 140, 248, 0.6)",
      rsiLine: "#818CF8",
      rsiOverbought: "rgba(223, 27, 65, 0.5)",
      rsiOversold: "rgba(48, 177, 113, 0.5)",
      macdLine: "#818CF8",
      macdSignal: "#FFB84D",
      macdHistUp: "rgba(48, 177, 113, 0.5)",
      macdHistDown: "rgba(223, 27, 65, 0.5)",
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

  // 计算所有技术指标
  const indicators = useMemo(() => {
    const closes = data.map((d) => d.close);
    const times = data.map((d) =>
      typeof d.time === "string" ? d.time : new Date(d.time).toISOString().split("T")[0]
    );

    // MA
    const maData: Record<number, LineData[]> = {};
    maLengths.forEach((length) => {
      const sma = calculateSMA(closes, length);
      maData[length] = sma
        .map((value, index) =>
          value !== null ? { time: times[index] as Time, value } : null
        )
        .filter((d): d is LineData => d !== null);
    });

    // Bollinger
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

    // RSI
    const rsiRaw = calculateRSI(closes, 14);
    const rsiData = rsiRaw
      .map((value, index) =>
        value !== null ? { time: times[index] as Time, value } : null
      )
      .filter((d): d is LineData => d !== null);

    // MACD
    const macdRaw = calculateMACD(closes, 12, 26, 9);
    const macdLineData = macdRaw.macd
      .map((value, index) =>
        value !== null ? { time: times[index] as Time, value } : null
      )
      .filter((d): d is LineData => d !== null);
    const macdSignalData = macdRaw.signal
      .map((value, index) =>
        value !== null ? { time: times[index] as Time, value } : null
      )
      .filter((d): d is LineData => d !== null);
    const macdHistData = macdRaw.histogram
      .map((value, index) => {
        if (value === null) return null;
        return {
          time: times[index] as Time,
          value,
          color: value >= 0 ? currentColors.macdHistUp : currentColors.macdHistDown,
        } as HistogramData;
      })
      .filter((d): d is HistogramData => d !== null);

    return { maData, bollingerData, rsiData, macdLineData, macdSignalData, macdHistData };
  }, [data, maLengths, bollingerLength, bollingerStdDev, currentColors]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const hasSubPanel = subPanel !== "none";

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
          bottom: hasSubPanel ? 0.25 : 0.05,
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

    // K线
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: currentColors.upColor,
      downColor: currentColors.downColor,
      borderVisible: false,
      wickUpColor: currentColors.wickUpColor,
      wickDownColor: currentColors.wickDownColor,
    });
    candlestickSeries.setData(formatCandleData(data));
    candleSeriesRef.current = candlestickSeries;

    // ---- 子面板 ----
    const subPanelScaleId = "sub-panel";
    const subPanelMargins = { top: 0.82, bottom: 0 };

    if (subPanel === "volume" && volumeData) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: subPanelScaleId,
      });
      chart.priceScale(subPanelScaleId).applyOptions({ scaleMargins: subPanelMargins });
      volumeSeries.setData(formatVolumeData(data, volumeData));
      volumeSeriesRef.current = volumeSeries;
    }

    if (subPanel === "rsi") {
      const rsiSeries = chart.addSeries(LineSeries, {
        color: currentColors.rsiLine,
        lineWidth: 2,
        priceScaleId: subPanelScaleId,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      chart.priceScale(subPanelScaleId).applyOptions({ scaleMargins: subPanelMargins });
      rsiSeries.setData(indicators.rsiData);
      // 超买超卖参考线
      rsiSeries.createPriceLine({
        price: 70,
        color: currentColors.rsiOverbought,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
        title: "",
      });
      rsiSeries.createPriceLine({
        price: 30,
        color: currentColors.rsiOversold,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
        title: "",
      });
      rsiSeriesRef.current = rsiSeries;
    }

    if (subPanel === "macd") {
      const macdHist = chart.addSeries(HistogramSeries, {
        priceScaleId: subPanelScaleId,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      macdHist.setData(indicators.macdHistData);
      macdHistRef.current = macdHist;

      chart.priceScale(subPanelScaleId).applyOptions({ scaleMargins: subPanelMargins });

      const macdLine = chart.addSeries(LineSeries, {
        color: currentColors.macdLine,
        lineWidth: 2,
        priceScaleId: subPanelScaleId,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      macdLine.setData(indicators.macdLineData);
      macdLineRef.current = macdLine;

      const macdSignal = chart.addSeries(LineSeries, {
        color: currentColors.macdSignal,
        lineWidth: 1,
        priceScaleId: subPanelScaleId,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      macdSignal.setData(indicators.macdSignalData);
      macdSignalRef.current = macdSignal;
    }

    // ---- 均线 ----
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

    // ---- 布林带 ----
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

    // 十字光标
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

          // RSI
          let rsiValue: number | null = null;
          if (rsiSeriesRef.current) {
            const d = param.seriesData.get(rsiSeriesRef.current);
            rsiValue = d && "value" in d ? (d as LineData).value : null;
          }

          // MACD
          let macdValues: { macd: number | null; signal: number | null; histogram: number | null } | undefined;
          if (macdLineRef.current) {
            const ml = param.seriesData.get(macdLineRef.current);
            const ms = macdSignalRef.current ? param.seriesData.get(macdSignalRef.current) : undefined;
            const mh = macdHistRef.current ? param.seriesData.get(macdHistRef.current) : undefined;
            macdValues = {
              macd: ml && "value" in ml ? (ml as LineData).value : null,
              signal: ms && "value" in ms ? (ms as LineData).value : null,
              histogram: mh && "value" in mh ? (mh as HistogramData).value : null,
            };
          }

          onCrosshairMove({
            candle,
            ma: maValues,
            bollinger: bollingerValues,
            rsi: rsiValue,
            macd: macdValues,
          });
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
      volumeSeriesRef.current = null;
      rsiSeriesRef.current = null;
      macdLineRef.current = null;
      macdSignalRef.current = null;
      macdHistRef.current = null;
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
    subPanel,
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
