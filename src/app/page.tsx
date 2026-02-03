import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MarketStatusBar } from "@/components/dashboard/MarketStatusBar";
import { StrategyPanel } from "@/components/dashboard/StrategyPanel";
import { MoatScannerTable } from "@/components/dashboard/MoatScannerTable";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="仪表盘"
          description="三层量化交易系统 — 人机协作模式"
        />
        <div className="p-8">
          {/* 市场状态 */}
          <MarketStatusBar />

          {/* 三层策略面板 */}
          <StrategyPanel />

          {/* 护城河审批队列 */}
          <MoatScannerTable />
        </div>
      </main>
    </div>
  );
}
