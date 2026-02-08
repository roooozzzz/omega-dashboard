"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MoatProposal } from "@/lib/moat-data";

const statusConfig = {
  "待审核": {
    icon: Clock,
    variant: "warning" as const,
    color: "text-stripe-warning",
  },
  "已通过": {
    icon: CheckCircle,
    variant: "success" as const,
    color: "text-stripe-success",
  },
  "已拒绝": {
    icon: XCircle,
    variant: "danger" as const,
    color: "text-stripe-danger",
  },
};

const confidenceColor = {
  "高": "text-stripe-success",
  "中": "text-stripe-warning",
  "低": "text-stripe-danger",
};

interface MoatDetailCardProps {
  proposal: MoatProposal;
  onApprove?: (ticker: string, adjustedScores?: Record<string, number>) => void;
  onReject?: (ticker: string) => void;
  loading?: boolean;
}

export function MoatDetailCard({
  proposal,
  onApprove,
  onReject,
  loading = false,
}: MoatDetailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusConfig[proposal.status].icon;
  const isPending = proposal.status === "待审核";

  // 初始化编辑分数（仅待审核时可编辑）
  const initialScores = useMemo(() => {
    const scores: Record<string, number> = {};
    proposal.powers.forEach((p) => {
      scores[p.name] = p.score;
    });
    return scores;
  }, [proposal.powers]);

  const [editedScores, setEditedScores] = useState<Record<string, number>>(initialScores);

  // 计算编辑后的总分
  const editedTotal = useMemo(
    () => Object.values(editedScores).reduce((sum, s) => sum + s, 0),
    [editedScores]
  );

  // 检测是否有修改
  const hasChanges = useMemo(
    () => proposal.powers.some((p) => editedScores[p.name] !== p.score),
    [proposal.powers, editedScores]
  );

  const handleScoreChange = (name: string, value: number) => {
    setEditedScores((prev) => ({ ...prev, [name]: value }));
  };

  // 构建 adjustedScores 对象（使用 powers 的 key 映射）
  const buildAdjustedScores = (): Record<string, number> | undefined => {
    if (!hasChanges) return undefined;
    // 根据 power.name 映射回 API key
    const nameToKey: Record<string, string> = {
      "规模经济": "scaleEconomies",
      "网络效应": "networkEffects",
      "差异化定位": "counterPositioning",
      "转换成本": "switchingCosts",
      "品牌": "branding",
      "稀缺资源": "corneredResource",
      "流程优势": "processPower",
    };
    const result: Record<string, number> = {};
    for (const [name, score] of Object.entries(editedScores)) {
      const key = nameToKey[name];
      if (key) result[key] = score;
    }
    return result;
  };

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)] hover:shadow-[var(--shadow-omega)] transition-shadow duration-150">
      {/* Header Row */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-stripe-bg flex items-center justify-center">
            <span className="text-lg font-semibold text-stripe-ink">
              {proposal.ticker[0]}
            </span>
          </div>

          {/* Stock Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stripe-ink">
                {proposal.ticker}
              </h3>
              <StatusBadge variant="neutral">{proposal.sector}</StatusBadge>
            </div>
            <p className="text-sm text-stripe-ink-lighter">{proposal.name}</p>
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-8">
          {/* AI Score */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-stripe-ink">
              {isPending && hasChanges ? editedTotal : proposal.aiScore}
              <span className="text-sm text-stripe-ink-lighter font-normal">
                /{proposal.maxScore}
              </span>
            </p>
            <p className="text-xs text-stripe-ink-lighter">
              AI 评分
              {isPending && hasChanges && (
                <span className="ml-1 text-stripe-purple">已调整</span>
              )}
            </p>
          </div>

          {/* Confidence */}
          <div className="text-center">
            <p
              className={`text-lg font-semibold ${
                confidenceColor[proposal.confidence]
              }`}
            >
              {proposal.confidence}
            </p>
            <p className="text-xs text-stripe-ink-lighter">置信度</p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`w-5 h-5 ${statusConfig[proposal.status].color}`}
            />
            <StatusBadge variant={statusConfig[proposal.status].variant}>
              {proposal.status}
            </StatusBadge>
          </div>

          {/* Expand */}
          <button className="p-2 hover:bg-stripe-bg rounded-md transition-colors">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-stripe-ink-lighter" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stripe-ink-lighter" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-stripe-border">
          {/* Powers Grid */}
          <div className="p-5 grid grid-cols-4 md:grid-cols-7 gap-4">
            {proposal.powers.map((power) => {
              const Icon = power.icon;
              const currentScore = isPending
                ? editedScores[power.name] ?? power.score
                : power.score;
              const percentage = (currentScore / power.maxScore) * 100;
              return (
                <div
                  key={power.name}
                  className="p-4 bg-stripe-bg rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-stripe-ink-light" />
                    <span className="text-sm font-medium text-stripe-ink">
                      {power.name}
                    </span>
                  </div>
                  {isPending ? (
                    /* 可编辑滑杆 */
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="range"
                        min={0}
                        max={power.maxScore}
                        step={1}
                        value={currentScore}
                        onChange={(e) =>
                          handleScoreChange(power.name, Number(e.target.value))
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="omega-slider flex-1"
                      />
                      <span className="text-sm font-medium text-stripe-ink tabular-nums w-8 text-right">
                        {currentScore}/{power.maxScore}
                      </span>
                    </div>
                  ) : (
                    /* 静态进度条 */
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-stripe-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stripe-purple rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-stripe-ink">
                        {power.score}/{power.maxScore}
                      </span>
                    </div>
                  )}
                  {power.description && (
                    <p className="text-xs text-stripe-ink-lighter">
                      {power.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Summary */}
          {proposal.aiSummary && (
            <div className="px-5 pb-5">
              <div className="p-4 bg-stripe-info-light rounded-lg">
                <h4 className="text-sm font-medium text-stripe-info-text mb-2">
                  AI 分析摘要
                </h4>
                <p className="text-sm text-stripe-ink-light">
                  {proposal.aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 pb-5 flex items-center justify-between">
            <p className="text-xs text-stripe-ink-lighter">
              分析时间: {proposal.analyzedAt}
            </p>
            {isPending && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-stripe-border text-stripe-ink hover:bg-stripe-danger-light hover:text-stripe-danger-text hover:border-stripe-danger-light"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject?.(proposal.ticker);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  拒绝
                </Button>
                <Button
                  className="bg-stripe-success text-white hover:bg-stripe-success/90"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.(proposal.ticker, buildAdjustedScores());
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  确认
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
