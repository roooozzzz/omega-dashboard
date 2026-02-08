"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  X,
  Zap,
} from "lucide-react";
import { MainContent } from "@/components/layout/MainContent";
import { Header } from "@/components/layout/Header";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";
import { StrategyStats, StatCardConfig } from "@/components/signals/StrategyStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { DecisionHistory } from "@/components/signals/DecisionHistory";
import { useSignals, useSignalStream } from "@/hooks/useSignals";

export default function ShortSignalsPage() {
  const [searchText, setSearchText] = useState("");
  const [action, setAction] = useState("");
  const { stats, loading, error, refresh } = useSignals({
    strategy: "short",
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const { connected, connect, disconnect } = useSignalStream({
    onSignal: () => refresh(),
  });

  const byDecision = stats?.byDecision;

  const cards: StatCardConfig[] = [
    {
      label: "买入信号",
      value: stats?.byType.buy ?? 0,
      icon: <TrendingUp className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "卖出信号",
      value: stats?.byType.sell ?? 0,
      icon: <TrendingDown className="w-5 h-5 text-stripe-danger" />,
    },
    {
      label: "预警信号",
      value: stats?.byType.alert ?? 0,
      icon: <AlertTriangle className="w-5 h-5 text-stripe-warning" />,
    },
    {
      label: "已确认",
      value: byDecision?.confirmed ?? 0,
      icon: <Check className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "已忽略",
      value: byDecision?.ignored ?? 0,
      icon: <X className="w-5 h-5 text-stripe-ink-lighter" />,
    },
    {
      label: "今日活跃",
      value: stats?.active ?? 0,
      icon: <Zap className="w-5 h-5 text-stripe-warning" />,
    },
  ];

  return (
    <MainContent>
      <Header
        title="短线策略 · THE SWING"
        description="情绪捕捉 + 快速反应 | 20% 目标仓位"
      />
      <div className="p-4 md:p-6 lg:p-8">
        <SyncStatusBar />
        <StrategyStats
          cards={cards}
          loading={loading}
          error={error}
          onRefresh={refresh}
          wsConnected={connected}
          onWsConnect={connect}
          onWsDisconnect={disconnect}
        />
        <SignalsFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          action={action}
          onActionChange={setAction}
        />
        <SignalsTable strategy="short" ticker={searchText || undefined} action={action || undefined} />
        <div className="mt-6">
          <DecisionHistory strategy="short" />
        </div>
      </div>
    </MainContent>
  );
}
