"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MoatStats } from "@/components/moat-scanner/MoatStats";
import { MoatFilters } from "@/components/moat-scanner/MoatFilters";
import { MoatDetailCard } from "@/components/moat-scanner/MoatDetailCard";
import { demoProposals } from "@/lib/moat-data";

export default function MoatScannerPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="护城河扫描"
          description="AI 驱动的护城河分析与人工审批工作流"
        />
        <div className="p-8">
          {/* 统计概览 */}
          <MoatStats />

          {/* 筛选器 */}
          <MoatFilters />

          {/* 提案列表 */}
          <div className="space-y-4">
            {demoProposals.map((proposal) => (
              <MoatDetailCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
