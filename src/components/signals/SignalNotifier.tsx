"use client";

import { useEffect, useCallback } from "react";
import { useSignalStream } from "@/hooks/useSignals";
import { useToast } from "@/components/ui/toast";
import { TradingSignal, ACTION_CONFIG, STRATEGY_CONFIG, SIGNAL_TYPE_CONFIG } from "@/types/signals";
import { Wifi, WifiOff } from "lucide-react";

interface SignalNotifierProps {
  onNewSignal?: (signal: TradingSignal) => void;
}

export function SignalNotifier({ onNewSignal }: SignalNotifierProps) {
  const { addToast } = useToast();

  const handleSignal = useCallback((signal: TradingSignal) => {
    const actionConfig = ACTION_CONFIG[signal.action];
    const strategyConfig = STRATEGY_CONFIG[signal.strategy];
    const signalTypeConfig = SIGNAL_TYPE_CONFIG[signal.signal_type];

    // 显示 Toast 通知
    addToast({
      type: actionConfig.variant === "success" ? "success" 
          : actionConfig.variant === "danger" ? "error"
          : actionConfig.variant === "warning" ? "warning" 
          : "info",
      title: `${signal.ticker} - ${signalTypeConfig?.label || signal.signal_type}`,
      message: `${strategyConfig.label}策略 | ${actionConfig.label} | 评分 ${signal.score}`,
      duration: 8000,
    });

    onNewSignal?.(signal);
  }, [addToast, onNewSignal]);

  const { connected, connect, disconnect } = useSignalStream({
    onSignal: handleSignal,
    autoReconnect: true,
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
