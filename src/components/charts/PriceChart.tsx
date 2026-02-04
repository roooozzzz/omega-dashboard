"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PriceChartProps {
  data: { date: string; price: number }[];
  height?: number;
  showGrid?: boolean;
  color?: string;
}

export function PriceChart({
  data,
  height = 200,
  showGrid = true,
  color = "#635BFF",
}: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-stripe-bg rounded-lg">
        <p className="text-sm text-stripe-ink-lighter">暂无数据</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const avgPrice = data.reduce((sum, d) => sum + d.price, 0) / data.length;

  // 判断趋势
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const isUp = lastPrice >= firstPrice;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E3E8EF"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#697386" }}
          tickLine={false}
          axisLine={{ stroke: "#E3E8EF" }}
        />
        <YAxis
          domain={[minPrice * 0.98, maxPrice * 1.02]}
          tick={{ fontSize: 10, fill: "#697386" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #E3E8EF",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
          }}
          formatter={(value) => value != null ? [`$${Number(value).toFixed(2)}`, "价格"] : ["--", "价格"]}
          labelFormatter={(label) => `日期: ${label}`}
        />
        <ReferenceLine
          y={avgPrice}
          stroke="#A3ACB9"
          strokeDasharray="5 5"
          strokeWidth={1}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={isUp ? "#30B66A" : "#DC3545"}
          strokeWidth={2}
          dot={false}
          activeDot={{
            r: 4,
            fill: isUp ? "#30B66A" : "#DC3545",
            stroke: "white",
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface RSIChartProps {
  data: { date: string; rsi: number }[];
  height?: number;
}

export function RSIChart({ data, height = 120 }: RSIChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 bg-stripe-bg rounded-lg">
        <p className="text-sm text-stripe-ink-lighter">暂无数据</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E3E8EF"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#697386" }}
          tickLine={false}
          axisLine={{ stroke: "#E3E8EF" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#697386" }}
          tickLine={false}
          axisLine={false}
          ticks={[30, 50, 70]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #E3E8EF",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
          }}
          formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}`, "RSI"]}
        />
        {/* 超买超卖线 */}
        <ReferenceLine y={70} stroke="#DC3545" strokeDasharray="5 5" />
        <ReferenceLine y={30} stroke="#30B66A" strokeDasharray="5 5" />
        <ReferenceLine y={50} stroke="#A3ACB9" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="rsi"
          stroke="#635BFF"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function MiniSparkline({
  data,
  width = 80,
  height = 24,
}: MiniSparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#30B66A" : "#DC3545"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
