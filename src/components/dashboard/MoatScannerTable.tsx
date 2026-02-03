"use client";

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

interface MoatProposal {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  moatScore: number;
  confidence: "高" | "中" | "低";
  status: "待审核" | "已通过" | "已拒绝";
}

const proposals: MoatProposal[] = [
  {
    id: "1",
    ticker: "CRWD",
    name: "CrowdStrike Holdings",
    sector: "网络安全",
    moatScore: 23,
    confidence: "高",
    status: "待审核",
  },
  {
    id: "2",
    ticker: "SNOW",
    name: "Snowflake Inc",
    sector: "云数据",
    moatScore: 19,
    confidence: "中",
    status: "待审核",
  },
  {
    id: "3",
    ticker: "DDOG",
    name: "Datadog Inc",
    sector: "可观测性",
    moatScore: 21,
    confidence: "高",
    status: "待审核",
  },
];

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
  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stripe-ink">护城河审批队列</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            AI 分析完成，等待人工审核确认
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
        >
          查看全部
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

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
                  <div>
                    <p className="font-medium text-sm text-stripe-ink">
                      {proposal.ticker}
                    </p>
                    <p className="text-xs text-stripe-ink-lighter">
                      {proposal.name}
                    </p>
                  </div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stripe-purple hover:bg-stripe-bg"
                  >
                    审核
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stripe-ink-lighter hover:bg-stripe-bg"
                  >
                    详情
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
