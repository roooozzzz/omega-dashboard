"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Shield,
  CheckCircle,
  TrendingUp,
  Check,
  X,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { MainContent } from "@/components/layout/MainContent";
import { Header } from "@/components/layout/Header";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";
import { StrategyStats, StatCardConfig } from "@/components/signals/StrategyStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { DecisionHistory } from "@/components/signals/DecisionHistory";
import { useSignals, useSignalStream } from "@/hooks/useSignals";
import { useMoatList, useMoatActions } from "@/hooks/useMoatData";
import type { MoatData } from "@/lib/api";

export default function LongSignalsPage() {
  const [searchText, setSearchText] = useState("");
  const [action, setAction] = useState("");
  const [newTicker, setNewTicker] = useState("");

  const { stats, loading, error, refresh } = useSignals({
    strategy: "long",
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const { data: moatData, loading: moatLoading, refresh: moatRefresh } = useMoatList(true, 60000);
  const { approve, reject: rejectMoat, propose, approving, rejecting, proposing } = useMoatActions();

  const { connected, connect, disconnect } = useSignalStream({
    onSignal: () => refresh(),
  });

  // 构建 ticker -> MoatData 映射，供 SignalsTable 使用
  const moatMap = useMemo(() => {
    const map: Record<string, MoatData> = {};
    for (const m of moatData) {
      map[m.ticker] = m;
    }
    return map;
  }, [moatData]);

  const moatStats = useMemo(() => {
    const pending = moatData.filter((m) => m.status === "pending").length;
    const verified = moatData.filter((m) => m.status === "verified").length;
    return { total: moatData.length, pending, verified };
  }, [moatData]);

  const byDecision = stats?.byDecision;

  const handlePropose = async () => {
    const t = newTicker.trim().toUpperCase();
    if (!t) return;
    const result = await propose(t);
    if (result) {
      setNewTicker("");
      await moatRefresh();
    }
  };

  const handleMoatApprove = useCallback(async (ticker: string, adjustedScores?: Record<string, number>) => {
    const result = await approve(ticker, adjustedScores);
    if (result) await moatRefresh();
  }, [approve, moatRefresh]);

  const handleMoatReject = useCallback(async (ticker: string) => {
    const result = await rejectMoat(ticker);
    if (result) await moatRefresh();
  }, [rejectMoat, moatRefresh]);

  const cards: StatCardConfig[] = [
    {
      label: "已分析总数",
      value: moatLoading ? "-" : moatStats.total,
      change: moatStats.pending > 0 ? `${moatStats.pending} 待审核` : undefined,
      changeType: "neutral",
      icon: <Shield className="w-5 h-5 text-stripe-purple" />,
    },
    {
      label: "护城河已通过",
      value: moatLoading ? "-" : moatStats.verified,
      change: moatStats.total > 0
        ? `${Math.round((moatStats.verified / moatStats.total) * 100)}%`
        : undefined,
      changeType: "positive",
      icon: <CheckCircle className="w-5 h-5 text-stripe-success" />,
    },
    {
      label: "买入信号",
      value: stats?.byType.buy ?? 0,
      icon: <TrendingUp className="w-5 h-5 text-stripe-success" />,
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
      label: "待决策",
      value: byDecision?.pending ?? 0,
      icon: <AlertCircle className="w-5 h-5 text-stripe-purple" />,
    },
  ];

  // 添加新公司的操作区
  const addCompanySlot = (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={newTicker}
        onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handlePropose()}
        placeholder="如 AMZN"
        className="w-28 px-3 py-2 text-sm border border-stripe-border rounded-md focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
      />
      <button
        onClick={handlePropose}
        disabled={proposing || !newTicker.trim()}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-stripe-purple text-white hover:bg-stripe-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {proposing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        添加
      </button>
    </div>
  );

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
          extraSlot={addCompanySlot}
        />
        <SignalsTable
          strategy="long"
          ticker={searchText || undefined}
          action={action || undefined}
          moatMap={moatMap}
          onMoatApprove={handleMoatApprove}
          onMoatReject={handleMoatReject}
          moatLoading={approving || rejecting}
        />
        <div className="mt-6">
          <DecisionHistory strategy="long" />
        </div>
      </div>
    </MainContent>
  );
}
