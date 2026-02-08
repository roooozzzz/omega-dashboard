"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Building2,
} from "lucide-react";
import { MainContent } from "@/components/layout/MainContent";
import { Header } from "@/components/layout/Header";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";
import { StrategyStats, StatCardConfig } from "@/components/signals/StrategyStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { MoatApprovalTab } from "@/components/signals/MoatApprovalTab";
import { DecisionHistory } from "@/components/signals/DecisionHistory";
import { useSignals, useSignalStream } from "@/hooks/useSignals";
import { useMoatList } from "@/hooks/useMoatData";

export default function LongSignalsPage() {
  const [searchText, setSearchText] = useState("");
  const [action, setAction] = useState("");

  const { stats, loading, error, refresh } = useSignals({
    strategy: "long",
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const { data: moatData, loading: moatLoading } = useMoatList(true, 60000);

  const { connected, connect, disconnect } = useSignalStream({
    onSignal: () => refresh(),
  });

  const moatStats = useMemo(() => {
    const pending = moatData.filter((m) => m.status === "pending").length;
    const verified = moatData.filter((m) => m.status === "verified").length;
    const rejected = moatData.filter((m) => m.status === "rejected").length;
    return { pending, verified, rejected };
  }, [moatData]);

  const cards: StatCardConfig[] = [
    {
      label: "护城河待审核",
      value: moatLoading ? "-" : moatStats.pending,
      icon: <Clock className="w-5 h-5 text-stripe-warning" />,
    },
    {
      label: "护城河已通过",
      value: moatLoading ? "-" : moatStats.verified,
      icon: <CheckCircle className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "护城河已拒绝",
      value: moatLoading ? "-" : moatStats.rejected,
      icon: <XCircle className="w-5 h-5 text-stripe-danger" />,
    },
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
      label: "长线总信号",
      value: stats?.byStrategy.long ?? 0,
      change: stats?.active ? `${stats.active} 活跃` : undefined,
      changeType: "positive",
      icon: <Building2 className="w-5 h-5 text-stripe-purple" />,
    },
  ];

  return (
    <MainContent>
      <Header
        title="长线策略 · THE CORE"
        description="护城河筛选 + 基本面分析 | 50% 目标仓位"
      />
      <div className="p-4 md:p-6 lg:p-8">
        <SyncStatusBar />
        <StrategyStats
          cards={cards}
          loading={loading && moatLoading}
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
        <SignalsTable strategy="long" ticker={searchText || undefined} action={action || undefined} />
        <div className="mt-6">
          <MoatApprovalTab />
        </div>
        <div className="mt-6">
          <DecisionHistory strategy="long" />
        </div>
      </div>
    </MainContent>
  );
}
