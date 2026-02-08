"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Header } from "@/components/layout/Header";
import { MarketStatusBar } from "@/components/dashboard/MarketStatusBar";
import { StrategyPanel } from "@/components/dashboard/StrategyPanel";
import { MoatScannerTable } from "@/components/dashboard/MoatScannerTable";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      <MainContent>
        <Header
          title="仪表盘"
          description="四层量化交易系统 — 人机协作模式"
        />
        <div className="p-4 md:p-6 lg:p-8">
          {/* 同步状态 */}
          <SyncStatusBar />

          {/* 市场状态 */}
          <MarketStatusBar />

          {/* 四层策略面板 */}
          <StrategyPanel />

          {/* 护城河审批队列 */}
          <MoatScannerTable />
        </div>
      </MainContent>
    </div>
  );
}
