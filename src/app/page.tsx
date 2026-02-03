import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MarketStatusBar } from "@/components/dashboard/MarketStatusBar";
import { StrategyPanel } from "@/components/dashboard/StrategyPanel";
import { MoatScannerTable } from "@/components/dashboard/MoatScannerTable";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="Dashboard"
          description="Monitor your quantitative trading system"
        />
        <div className="p-8">
          {/* Market Status Bar */}
          <MarketStatusBar />

          {/* Three Strategy Panels */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <StrategyPanel type="long" />
            <StrategyPanel type="mid" />
            <StrategyPanel type="short" />
          </div>

          {/* Moat Scanner Table */}
          <MoatScannerTable />
        </div>
      </main>
    </div>
  );
}
