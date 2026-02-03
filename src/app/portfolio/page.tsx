import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="Portfolio"
          description="Position management and allocation"
        />
        <div className="p-8">
          <div className="bg-white rounded-lg border border-stripe-border p-12 text-center">
            <p className="text-stripe-ink-lighter">Portfolio page — coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}
