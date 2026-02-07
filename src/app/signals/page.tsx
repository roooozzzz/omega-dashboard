"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Header } from "@/components/layout/Header";
import { SignalsStats } from "@/components/signals/SignalsStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { DecisionHistory } from "@/components/signals/DecisionHistory";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      <MainContent>
        <Header
          title="交易信号"
          description="三层策略信号历史与实时追踪"
        />
        <div className="p-4 md:p-6 lg:p-8">
          {/* 同步状态 */}
          <SyncStatusBar />

          {/* 统计概览 */}
          <SignalsStats />

          {/* 筛选器 */}
          <SignalsFilters />

          {/* 信号表格 */}
          <SignalsTable />

          {/* 决策记录 */}
          <div className="mt-6">
            <DecisionHistory />
          </div>
        </div>
      </MainContent>
    </div>
  );
}
