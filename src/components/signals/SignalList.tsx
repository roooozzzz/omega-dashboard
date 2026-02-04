"use client";

import { TradingSignal } from "@/types/signals";
import { SignalCard } from "./SignalCard";

interface SignalListProps {
  signals: TradingSignal[];
  loading?: boolean;
  onSignalClick?: (signal: TradingSignal) => void;
}

export function SignalList({ signals, loading, onSignalClick }: SignalListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="bg-white rounded-lg border border-stripe-border p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-stripe-bg" />
              <div className="flex-1">
                <div className="h-4 bg-stripe-bg rounded w-20 mb-1" />
                <div className="h-3 bg-stripe-bg rounded w-16" />
              </div>
            </div>
            <div className="h-6 bg-stripe-bg rounded w-24 mb-3" />
            <div className="h-4 bg-stripe-bg rounded w-full mb-2" />
            <div className="h-4 bg-stripe-bg rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-12 text-stripe-ink-lighter">
        <p>暂无信号</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {signals.map((signal) => (
        <SignalCard
          key={signal.id}
          signal={signal}
          onClick={() => onSignalClick?.(signal)}
        />
      ))}
    </div>
  );
}
