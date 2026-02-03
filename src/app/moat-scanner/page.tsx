import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function MoatScannerPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="Moat Scanner"
          description="AI-powered moat analysis and approval"
        />
        <div className="p-8">
          <div className="bg-white rounded-lg border border-stripe-border p-12 text-center">
            <p className="text-stripe-ink-lighter">Moat Scanner full page — coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}
