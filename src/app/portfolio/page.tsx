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
          title="Portfolio"
          description="Position management and allocation tracking"
        />
        <div className="p-8">
          {/* Stats Overview */}
          <PortfolioStats />

          {/* Allocation Chart */}
          <AllocationChart />

          {/* Positions Table */}
          <PositionsTable />
        </div>
      </main>
    </div>
  );
}
