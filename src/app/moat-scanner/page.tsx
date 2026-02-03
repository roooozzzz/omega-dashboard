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
          title="Moat Scanner"
          description="AI-powered moat analysis and approval workflow"
        />
        <div className="p-8">
          {/* Stats Overview */}
          <MoatStats />

          {/* Filters */}
          <MoatFilters />

          {/* Proposals List */}
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
