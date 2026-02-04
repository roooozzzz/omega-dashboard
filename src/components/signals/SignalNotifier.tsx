"use client";

import { useEffect, useCallback } from "react";
import { useSignalStream } from "@/hooks/useSignals";
import { useToast } from "@/components/ui/toast";
import { TradingSignal } from "@/hooks/useSignals";
import { Wifi, WifiOff } from "lucide-react";

interface SignalNotifierProps {
  onNewSignal?: (signal: TradingSignal) => void;
}

export function SignalNotifier({ onNewSignal }: SignalNotifierProps) {
  const { addToast } = useToast();

  const handleSignal = useCallback((signal: TradingSignal) => {
    const typeLabel = signal.type === "buy" ? "买入" 
                    : signal.type === "sell" ? "卖出"
                    : signal.type === "watch" ? "观望"
                    : "警报";
    
    const strategyLabel = signal.strategy === "long" ? "长线"
                        : signal.strategy === "mid" ? "中线"
                        : "短线";

    // 显示 Toast 通知
    addToast({
      type: signal.type === "buy" ? "success" 
          : signal.type === "sell" ? "error"
          : signal.type === "watch" ? "warning" 
          : "info",
      title: `${signal.ticker} - ${signal.indicator}`,
      message: `${strategyLabel}策略 | ${typeLabel} | ${signal.reason}`,
      duration: 8000,
    });

    onNewSignal?.(signal);
  }, [addToast, onNewSignal]);

  const { connected, connect, disconnect } = useSignalStream({
    onSignal: handleSignal,
  });

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div 
      className={`
        fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 
        rounded-full text-xs font-medium shadow-lg transition-all
        ${connected 
          ? "bg-stripe-success/10 text-stripe-success border border-stripe-success/20" 
          : "bg-stripe-danger/10 text-stripe-danger border border-stripe-danger/20"
        }
      `}
    >
      {connected ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>实时连接</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>已断开</span>
        </>
      )}
    </div>
  );
}
