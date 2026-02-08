"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMoatList } from "@/hooks/useMoatData";

const confidenceMap: Record<string, "高" | "中" | "低"> = {
  High: "高",
  Medium: "中",
  Low: "低",
};

const statusMap: Record<string, "待审核" | "已通过" | "已拒绝"> = {
  PENDING: "待审核",
  VERIFIED: "已通过",
  REJECTED: "已拒绝",
};

const confidenceColor = {
  高: "success" as const,
  中: "warning" as const,
  低: "danger" as const,
};

const statusColor = {
  待审核: "warning" as const,
  已通过: "success" as const,
  已拒绝: "danger" as const,
};

export function MoatScannerTable() {
  const { data, loading, error } = useMoatList(false);

  // 只显示 PENDING 状态的提案
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingProposals = data.filter((d: any) => {
    const status = d.status || d.Status;
    return status === "PENDING" || status === "pending";
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposals = pendingProposals.slice(0, 5).map((d: any) => ({
    id: d.id || d.ticker,
    ticker: d.ticker,
    name: d.name || d.ticker,
    sector: d.sector || "",
    moatScore: d.totalScore || 0,
    confidence: confidenceMap[d.confidence] || "中",
    status: statusMap[d.status] || "待审核",
  }));

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stripe-ink">护城河审批队列</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            AI 分析完成，等待人工审核确认
          </p>
        </div>
        <Link href="/signals/long">
          <Button
            variant="outline"
            className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="p-8 text-center text-stripe-ink-lighter">
          加载中...
        </div>
      )}

      {error && (
        <div className="p-8 text-center text-stripe-danger text-sm">
          {error}
        </div>
      )}

      {!loading && !error && proposals.length === 0 && (
        <div className="p-8 text-center text-stripe-ink-lighter text-sm">
          暂无待审核提案
        </div>
      )}

      {!loading && !error && proposals.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-stripe-border">
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                股票
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                行业
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                护城河评分
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                置信度
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
                状态
              </TableHead>
              <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide text-right">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow
                key={proposal.id}
                className="hover:bg-stripe-bg border-b border-stripe-border-light"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stripe-bg flex items-center justify-center">
                      <span className="text-sm font-medium text-stripe-ink">
                        {proposal.ticker[0]}
                      </span>
                    </div>
                    <Link href={`/stock/${proposal.ticker}`} className="hover:underline">
                      <p className="font-medium text-sm text-stripe-ink">
                        {proposal.ticker}
                      </p>
                      <p className="text-xs text-stripe-ink-lighter">
                        {proposal.name}
                      </p>
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge variant="neutral">{proposal.sector}</StatusBadge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-stripe-ink">
                    {proposal.moatScore}
                    <span className="text-stripe-ink-lighter font-normal">
                      /35
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={confidenceColor[proposal.confidence]}>
                    {proposal.confidence}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={statusColor[proposal.status]}>
                    {proposal.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href="/signals/long">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-stripe-purple hover:bg-stripe-bg"
                      >
                        审核
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
