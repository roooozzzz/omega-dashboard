"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Header } from "@/components/layout/Header";
import { MoatStats } from "@/components/moat-scanner/MoatStats";
import { MoatFilters } from "@/components/moat-scanner/MoatFilters";
import { MoatDetailCard } from "@/components/moat-scanner/MoatDetailCard";
import { useMoatList, useMoatActions } from "@/hooks/useMoatData";
import { Shield, Building2, Users, Cpu, Scale, Zap, Cog } from "lucide-react";
import type { MoatProposal } from "@/lib/moat-data";

// 后端 → 前端字段转换
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

// 7 Powers 名称/图标映射
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

export default function MoatScannerPage() {
  const { data, loading, error, refresh } = useMoatList(false);
  const { approve, reject: rejectMoat, approving, rejecting } = useMoatActions();
  const [filter, setFilter] = useState<string>("");

  // 转换 API 数据为前端 MoatProposal 格式
  const proposals = useMemo(() => {
    return data.map(apiToProposal);
  }, [data]);

  // 筛选
  const filteredProposals = useMemo(() => {
    if (!filter) return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [proposals, filter]);

  // 统计数据
  const stats = useMemo(() => {
    const pending = proposals.filter((p) => p.status === "待审核").length;
    const verified = proposals.filter((p) => p.status === "已通过").length;
    const rejected = proposals.filter((p) => p.status === "已拒绝").length;
    return { total: proposals.length, pending, verified, rejected };
  }, [proposals]);

  const handleApprove = async (ticker: string) => {
    const result = await approve(ticker);
    if (result) {
      await refresh();
    }
  };

  const handleReject = async (ticker: string) => {
    const result = await rejectMoat(ticker);
    if (result) {
      await refresh();
    }
  };

  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      <MainContent>
        <Header
          title="护城河扫描"
          description="AI 驱动的护城河分析与人工审批工作流"
        />
        <div className="p-4 md:p-6 lg:p-8">
          {/* 统计概览 */}
          <MoatStats
            total={stats.total}
            pending={stats.pending}
            verified={stats.verified}
            rejected={stats.rejected}
          />

          {/* 筛选器 */}
          <MoatFilters onFilterChange={setFilter} currentFilter={filter} />

          {/* 加载 / 错误 / 空 */}
          {loading && (
            <div className="text-center py-12 text-stripe-ink-lighter">
              加载中...
            </div>
          )}
          {error && (
            <div className="text-center py-12 text-stripe-danger">
              {error}
            </div>
          )}

          {/* 提案列表 */}
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
        </div>
      </MainContent>
    </div>
  );
}
