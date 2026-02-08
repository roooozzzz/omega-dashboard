"use client";

import { useState, useMemo } from "react";
import { Shield, Building2, Users, Cpu, Scale, Zap, Cog, Plus, Loader2 } from "lucide-react";
import { MoatStats } from "@/components/moat-scanner/MoatStats";
import { MoatFilters } from "@/components/moat-scanner/MoatFilters";
import { MoatDetailCard } from "@/components/moat-scanner/MoatDetailCard";
import { useMoatList, useMoatActions } from "@/hooks/useMoatData";
import type { MoatProposal } from "@/lib/moat-data";

const statusMap: Record<string, "待审核" | "已通过" | "已拒绝"> = {
  PENDING: "待审核",
  VERIFIED: "已通过",
  REJECTED: "已拒绝",
};

const confidenceMap: Record<string, "高" | "中" | "低"> = {
  High: "高",
  Medium: "中",
  Low: "低",
};

const powersConfig = [
  { key: "scaleEconomies", name: "规模经济", icon: Scale },
  { key: "networkEffects", name: "网络效应", icon: Users },
  { key: "counterPositioning", name: "差异化定位", icon: Zap },
  { key: "switchingCosts", name: "转换成本", icon: Building2 },
  { key: "branding", name: "品牌", icon: Shield },
  { key: "corneredResource", name: "稀缺资源", icon: Cpu },
  { key: "processPower", name: "流程优势", icon: Cog },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function apiToProposal(apiData: any): MoatProposal {
  const scores = apiData.scores || {};
  return {
    id: apiData.id || apiData.ticker,
    ticker: apiData.ticker,
    name: apiData.name || apiData.ticker,
    sector: apiData.sector || "",
    aiScore: apiData.totalScore || 0,
    maxScore: 35,
    confidence: confidenceMap[apiData.confidence] || "中",
    status: statusMap[apiData.status] || "待审核",
    analyzedAt: apiData.createdAt
      ? new Date(apiData.createdAt).toLocaleString("zh-CN")
      : "",
    powers: powersConfig.map(({ key, name, icon }) => ({
      name,
      score: scores[key] || 0,
      maxScore: 5,
      icon,
      description: "",
    })),
    aiSummary: apiData.analysisSummary || "",
  };
}

export function MoatApprovalTab() {
  const { data, loading, error, refresh } = useMoatList(false);
  const { approve, reject: rejectMoat, propose, approving, rejecting, proposing } = useMoatActions();
  const [filter, setFilter] = useState<string>("");
  const [newTicker, setNewTicker] = useState("");

  const proposals = useMemo(() => data.map(apiToProposal), [data]);

  const filteredProposals = useMemo(() => {
    if (!filter) return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [proposals, filter]);

  const stats = useMemo(() => {
    const pending = proposals.filter((p) => p.status === "待审核").length;
    const verified = proposals.filter((p) => p.status === "已通过").length;
    const rejected = proposals.filter((p) => p.status === "已拒绝").length;
    return { total: proposals.length, pending, verified, rejected };
  }, [proposals]);

  const handlePropose = async () => {
    const t = newTicker.trim().toUpperCase();
    if (!t) return;
    const result = await propose(t);
    if (result) {
      setNewTicker("");
      await refresh();
    }
  };

  const handleApprove = async (ticker: string, adjustedScores?: Record<string, number>) => {
    const result = await approve(ticker, adjustedScores);
    if (result) await refresh();
  };

  const handleReject = async (ticker: string) => {
    const result = await rejectMoat(ticker);
    if (result) await refresh();
  };

  return (
    <>
      {/* 添加新公司 */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handlePropose()}
          placeholder="输入股票代码，如 AMZN"
          className="flex-1 max-w-xs px-3 py-2 text-sm border border-stripe-border rounded-md focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
        />
        <button
          onClick={handlePropose}
          disabled={proposing || !newTicker.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-stripe-purple text-white hover:bg-stripe-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {proposing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          添加新公司
        </button>
      </div>

      <MoatStats
        total={stats.total}
        pending={stats.pending}
        verified={stats.verified}
        rejected={stats.rejected}
      />
      <MoatFilters onFilterChange={setFilter} currentFilter={filter} />

      {loading && (
        <div className="text-center py-12 text-stripe-ink-lighter">
          加载中...
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-stripe-danger">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="text-center py-12 text-stripe-ink-lighter">
              暂无数据
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <MoatDetailCard
                key={proposal.id}
                proposal={proposal}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={approving || rejecting}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
