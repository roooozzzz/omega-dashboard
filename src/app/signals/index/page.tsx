"use client";

import { useState } from "react";
import {
  PieChart,
  Calendar,
  TrendingDown,
  AlertTriangle,
  Check,
  AlertCircle,
} from "lucide-react";
import { MainContent } from "@/components/layout/MainContent";
import { Header } from "@/components/layout/Header";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";
import { StrategyStats, StatCardConfig } from "@/components/signals/StrategyStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { DecisionHistory } from "@/components/signals/DecisionHistory";
import { IndexWatchlistPanel } from "@/components/signals/IndexWatchlistPanel";
import { useSignals, useSignalStream, useCrossStrategyMap } from "@/hooks/useSignals";
import { useIndexOverview } from "@/hooks/useIndexData";

export default function IndexSignalsPage() {
  const [searchText, setSearchText] = useState("");
  const [action, setAction] = useState("");
  const crossMap = useCrossStrategyMap("index");
  const { stats, loading, error, refresh } = useSignals({
    strategy: "index",
    autoRefresh: true,
    refreshInterval: 30000,
  });
  const { data: overview } = useIndexOverview();

  const { connected, connect, disconnect } = useSignalStream({
    onSignal: () => refresh(),
  });

  const byDecision = stats?.byDecision;

  const cards: StatCardConfig[] = [
    {
      label: "ETF 数量",
      value: overview?.totalEtfs ?? 4,
      icon: <PieChart className="w-5 h-5 text-blue-600" />,
      glossaryKey: "etfCount",
    },
    {
      label: "连续定投",
      value: `${overview?.dcaStreakWeeks ?? 0} 周`,
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      glossaryKey: "dcaStreak",
    },
    {
      label: "估值买入",
      value: overview?.valueSignals ?? 0,
      icon: <TrendingDown className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "风险预警",
      value: overview?.riskAlerts ?? 0,
      icon: <AlertTriangle className="w-5 h-5 text-stripe-warning" />,
    },
    {
      label: "已确认",
      value: byDecision?.confirmed ?? 0,
      icon: <Check className="w-5 h-5 text-stripe-success" />,
      glossaryKey: "confirmed",
    },
    {
      label: "待决策",
      value: byDecision?.pending ?? 0,
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      glossaryKey: "pendingDecision",
    },
  ];

  return (
    <MainContent>
      <Header
        title="指数策略 · THE BASE"
        description="指数定投 + 估值择时 | 35% 目标仓位"
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
        <IndexWatchlistPanel />
        <SignalsFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          action={action}
          onActionChange={setAction}
        />
        <SignalsTable
          strategy="index"
          ticker={searchText || undefined}
          action={action || undefined}
          crossStrategyMap={crossMap}
        />
        <div className="mt-6">
          <DecisionHistory strategy="index" />
        </div>
      </div>
    </MainContent>
  );
}
