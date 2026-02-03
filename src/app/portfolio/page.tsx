import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { PositionsTable } from "@/components/portfolio/PositionsTable";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="持仓管理"
          description="组合持仓与策略配置追踪"
        />
        <div className="p-8">
          {/* 统计概览 */}
          <PortfolioStats />

          {/* 策略配置图 */}
          <AllocationChart />

          {/* 持仓表格 */}
          <PositionsTable />
        </div>
      </main>
    </div>
  );
}
