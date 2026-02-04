"use client";

import { useState } from "react";

export type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "ALL" },
];

export function TimeRangeSelector({
  value,
  onChange,
  theme = "light",
  size = "md",
}: TimeRangeSelectorProps) {
  const [hoveredRange, setHoveredRange] = useState<TimeRange | null>(null);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const containerClasses = {
    light: "bg-stripe-bg border-stripe-border",
    dark: "bg-[#1E3A5F] border-[#2D4A6F]",
  };

  const buttonClasses = {
    light: {
      default: "text-stripe-ink-lighter hover:text-stripe-ink",
      active: "bg-white text-stripe-ink shadow-sm",
    },
    dark: {
      default: "text-[#A3B1BF] hover:text-white",
      active: "bg-[#0A2540] text-white shadow-sm",
    },
  };

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-lg border ${containerClasses[theme]} transition-all duration-200`}
    >
      {ranges.map((range) => {
        const isActive = value === range.value;
        const isHovered = hoveredRange === range.value;

        return (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            onMouseEnter={() => setHoveredRange(range.value)}
            onMouseLeave={() => setHoveredRange(null)}
            className={`
              ${sizeClasses[size]}
              font-medium rounded-md transition-all duration-200
              ${isActive ? buttonClasses[theme].active : buttonClasses[theme].default}
              ${!isActive && isHovered ? "scale-105" : ""}
              focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-opacity-50
            `}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
