"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Header } from "@/components/layout/Header";
import { SignalsStats } from "@/components/signals/SignalsStats";
import { SignalsFilters } from "@/components/signals/SignalsFilters";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { DecisionHistory } from "@/components/signals/DecisionHistory";
import { MoatApprovalTab } from "@/components/signals/MoatApprovalTab";
import { SyncStatusBar } from "@/components/shared/SyncStatusBar";

function SignalsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const strategy = searchParams.get("strategy") as
    | "long"
    | "mid"
    | "short"
    | null;
  const tab = searchParams.get("tab") || "signals";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `/signals?${qs}` : "/signals");
    },
    [searchParams, router]
  );

  const handleStrategyChange = useCallback(
    (s: string | null) => {
      updateParams({
        strategy: s,
        // 切换到非长线策略时清除 moat tab
        tab: s === "long" ? searchParams.get("tab") : null,
      });
    },
    [updateParams, searchParams]
  );

  const showMoatTab = strategy === "long";
  const activeTab = tab === "moat" && showMoatTab ? "moat" : "signals";

  return (
    <MainContent>
      <Header title="交易信号" description="三层策略信号历史与实时追踪" />
      <div className="p-4 md:p-6 lg:p-8">
        <SyncStatusBar />
        <SignalsStats />
        <SignalsFilters
          strategy={strategy}
          onStrategyChange={handleStrategyChange}
        />

        {/* 长线策略时显示 Tab 切换栏 */}
        {showMoatTab && (
          <div className="flex gap-1 mb-6 border-b border-stripe-border">
            <button
              onClick={() => updateParams({ tab: "signals" })}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "signals"
                  ? "border-stripe-purple text-stripe-purple"
                  : "border-transparent text-stripe-ink-lighter hover:text-stripe-ink"
              }`}
            >
              交易信号
            </button>
            <button
              onClick={() => updateParams({ tab: "moat" })}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "moat"
                  ? "border-stripe-purple text-stripe-purple"
                  : "border-transparent text-stripe-ink-lighter hover:text-stripe-ink"
              }`}
            >
              护城河审批
            </button>
          </div>
        )}

        {/* Tab 内容 */}
        {activeTab === "moat" ? (
          <MoatApprovalTab />
        ) : (
          <>
            <SignalsTable strategy={strategy ?? undefined} />
            <div className="mt-6">
              <DecisionHistory />
            </div>
          </>
        )}
      </div>
    </MainContent>
  );
}

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      <Suspense
        fallback={
          <MainContent>
            <div className="p-8 text-center text-stripe-ink-lighter">
              加载中...
            </div>
          </MainContent>
        }
      >
        <SignalsPageContent />
      </Suspense>
    </div>
  );
}
