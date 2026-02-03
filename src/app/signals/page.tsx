import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SignalsStats } from "@/components/signals/SignalsStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="Signals"
          description="Trading signals from all three strategies"
        />
        <div className="p-8">
          {/* Stats Overview */}
          <SignalsStats />

          {/* Filters */}
          <SignalsFilters />

          {/* Signals Table */}
          <SignalsTable />
        </div>
      </main>
    </div>
  );
}
